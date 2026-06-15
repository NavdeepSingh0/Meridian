import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from resumes.schema import get_empty_resume_document


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def empty_resume():
    return get_empty_resume_document()


@pytest.mark.django_db
def test_critique_api_success(api_client, empty_resume):
    url = reverse("analysis-critique")
    response = api_client.post(url, {"resume_data": empty_resume}, format="json")
    
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert "sections" in data


@pytest.mark.django_db
def test_critique_api_invalid_schema(api_client):
    url = reverse("analysis-critique")
    # Invalid resume (missing 'basics', etc.)
    response = api_client.post(url, {"resume_data": {"invalid": "schema"}}, format="json")
    
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "Schema validation failed" in data["error"]


@pytest.mark.django_db
def test_ats_score_api_success(api_client, empty_resume):
    url = reverse("analysis-ats-score")
    response = api_client.post(url, {"resume_data": empty_resume}, format="json")
    
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert data["has_job_description"] is False


@pytest.mark.django_db
def test_ats_score_api_with_jd_success(api_client, empty_resume):
    url = reverse("analysis-ats-score")
    response = api_client.post(
        url, 
        {"resume_data": empty_resume, "job_description": "We need a React dev."}, 
        format="json"
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["has_job_description"] is True
    assert len(data["missing_keywords"]) > 0


@pytest.mark.django_db
def test_export_pdf_not_implemented(api_client, empty_resume):
    url = reverse("analysis-export-pdf")
    response = api_client.post(
        url, 
        {"resume_data": empty_resume, "template_id": "classic"}, 
        format="json"
    )
    
    assert response.status_code == 501
