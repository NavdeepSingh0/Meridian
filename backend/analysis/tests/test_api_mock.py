import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from analysis import services
from core.models import Profile
from resumes.schema import get_empty_resume_document


@pytest.fixture
def empty_resume():
    return get_empty_resume_document()


def credits(user):
    return Profile.objects.get(user=user).ai_credits


# --- Authentication -------------------------------------------------------

@pytest.mark.django_db
@pytest.mark.parametrize(
    "name",
    ["analysis-critique", "analysis-ats-score", "analysis-export-pdf", "analysis-parse-pdf"],
)
def test_endpoints_require_auth(api_client, name):
    response = api_client.post(reverse(name), {}, format="json")
    assert response.status_code in (401, 403)


# --- Critique / ATS ------------------------------------------------------

def test_critique_success_costs_one_credit(auth_client, user, empty_resume):
    response = auth_client.post(reverse("analysis-critique"), {"resume_data": empty_resume}, format="json")
    assert response.status_code == 200
    assert "overall_score" in response.json()
    assert credits(user) == 2


def test_critique_invalid_schema_is_not_charged(auth_client, user):
    response = auth_client.post(
        reverse("analysis-critique"), {"resume_data": {"invalid": "schema"}}, format="json"
    )
    assert response.status_code == 400
    assert "Schema validation failed" in response.json()["error"]
    assert credits(user) == 3


def test_ats_score_without_jd(auth_client, empty_resume):
    response = auth_client.post(reverse("analysis-ats-score"), {"resume_data": empty_resume}, format="json")
    assert response.status_code == 200
    data = response.json()
    assert data["has_job_description"] is False
    assert data["matched_keywords"] == []


def test_ats_score_with_jd(auth_client, empty_resume):
    response = auth_client.post(
        reverse("analysis-ats-score"),
        {"resume_data": empty_resume, "job_description": "We need a React dev."},
        format="json",
    )
    assert response.status_code == 200
    data = response.json()
    assert data["has_job_description"] is True
    assert len(data["missing_keywords"]) > 0
    assert len(data["matched_keywords"]) > 0


# --- Credits -------------------------------------------------------------

def test_out_of_credits_returns_402(auth_client, user, empty_resume):
    Profile.objects.filter(user=user).update(ai_credits=0)
    response = auth_client.post(reverse("analysis-critique"), {"resume_data": empty_resume}, format="json")
    assert response.status_code == 402
    assert credits(user) == 0


def test_premium_users_are_not_charged(auth_client, user, empty_resume):
    Profile.objects.filter(user=user).update(is_premium=True)
    auth_client.post(reverse("analysis-critique"), {"resume_data": empty_resume}, format="json")
    assert credits(user) == 3


def test_credit_refunded_when_ai_call_fails(auth_client, user, empty_resume, mocker):
    mocker.patch.object(services, "generate_critique", side_effect=services.TimeoutOrUnavailableError())
    response = auth_client.post(reverse("analysis-critique"), {"resume_data": empty_resume}, format="json")
    assert response.status_code == 503
    assert credits(user) == 3


def test_apply_suggestion_charges_once_and_refunds_on_failure(auth_client, user, mocker):
    url = reverse("analysis-apply-suggestion")
    payload = {"section_name": "work", "section_data": [], "suggestion": "Quantify impact"}

    assert auth_client.post(url, payload, format="json").status_code == 200
    assert credits(user) == 2

    mocker.patch.object(services, "apply_suggestion", side_effect=services.TimeoutOrUnavailableError())
    assert auth_client.post(url, payload, format="json").status_code == 503
    assert credits(user) == 2


# --- PDF export ----------------------------------------------------------

def test_export_pdf_rejects_bad_template(auth_client, empty_resume):
    response = auth_client.post(
        reverse("analysis-export-pdf"),
        {"resume_data": empty_resume, "template_id": "nope"},
        format="json",
    )
    assert response.status_code == 400


def test_export_pdf_returns_pdf_with_safe_filename(auth_client, empty_resume, mocker):
    mocker.patch.object(services, "render_resume_pdf", return_value=b"%PDF-1.4 fake")
    empty_resume["basics"]["name"] = 'Ada "Lovelace"\r\nX-Evil: 1'
    response = auth_client.post(
        reverse("analysis-export-pdf"),
        {"resume_data": empty_resume, "template_id": "classic"},
        format="json",
    )
    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"
    disposition = response["Content-Disposition"]
    assert "\n" not in disposition and "\r" not in disposition
    assert disposition.count('"') == 2


def test_export_pdf_does_not_leak_exception_text(auth_client, empty_resume, mocker):
    mocker.patch.object(services, "render_resume_pdf", side_effect=Exception("secret internal path"))
    response = auth_client.post(
        reverse("analysis-export-pdf"),
        {"resume_data": empty_resume, "template_id": "classic"},
        format="json",
    )
    assert response.status_code == 500
    assert "secret" not in response.json()["detail"]


# --- PDF parse -----------------------------------------------------------

def _pdf_upload(content=b"%PDF-1.4 fake", name="resume.pdf"):
    return SimpleUploadedFile(name, content, content_type="application/pdf")


def test_parse_pdf_success(auth_client, user, empty_resume, mocker):
    mock_parse = mocker.patch.object(services, "parse_resume_pdf_upload", return_value=empty_resume)
    response = auth_client.post(reverse("analysis-parse-pdf"), {"file": _pdf_upload()}, format="multipart")
    assert response.status_code == 200
    assert response.json()["resume_data"] == empty_resume
    mock_parse.assert_called_once_with(b"%PDF-1.4 fake")
    assert credits(user) == 2


def test_parse_pdf_requires_file(auth_client):
    response = auth_client.post(reverse("analysis-parse-pdf"), {}, format="multipart")
    assert response.status_code == 400


def test_parse_pdf_rejects_non_pdf(auth_client, user):
    response = auth_client.post(
        reverse("analysis-parse-pdf"), {"file": _pdf_upload(b"not a pdf", "x.pdf")}, format="multipart"
    )
    assert response.status_code == 400
    assert credits(user) == 3


def test_parse_pdf_rejects_oversized(auth_client, user):
    big = b"%PDF-" + b"0" * (5 * 1024 * 1024 + 1)
    response = auth_client.post(reverse("analysis-parse-pdf"), {"file": _pdf_upload(big)}, format="multipart")
    assert response.status_code == 413
    assert credits(user) == 3


def test_parse_pdf_scanned_is_422_and_refunded(auth_client, user, mocker):
    mocker.patch.object(services, "parse_resume_pdf_upload", side_effect=services.ScannedPDFError("scanned"))
    response = auth_client.post(reverse("analysis-parse-pdf"), {"file": _pdf_upload()}, format="multipart")
    assert response.status_code == 422
    assert credits(user) == 3


# --- Text generation -----------------------------------------------------

def test_generate_summary_charges_a_credit(auth_client, user, empty_resume):
    response = auth_client.post(
        reverse("analysis-generate"), {"kind": "summary", "resume_data": empty_resume}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["text"]
    assert credits(user) == 2


def test_generate_rejects_unknown_kind(auth_client, user, empty_resume):
    response = auth_client.post(
        reverse("analysis-generate"), {"kind": "poem", "resume_data": empty_resume}, format="json"
    )
    assert response.status_code == 400
    assert credits(user) == 3


def test_generate_refunds_on_failure(auth_client, user, empty_resume, mocker):
    mocker.patch.object(services, "generate_text", side_effect=services.TimeoutOrUnavailableError())
    response = auth_client.post(
        reverse("analysis-generate"), {"kind": "bullet", "resume_data": empty_resume}, format="json"
    )
    assert response.status_code == 503
    assert credits(user) == 3
