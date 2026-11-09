import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from resumes.models import Resume
from resumes.schema import get_empty_resume_document

LIST_URL = "/api/resumes/"


@pytest.fixture
def other_client(db):
    other = get_user_model().objects.create_user(username="firebase-uid-2")
    client = APIClient()
    client.force_authenticate(user=other)
    return client


def test_requires_auth(api_client):
    assert api_client.get(LIST_URL).status_code in (401, 403)


def test_create_list_update_delete(auth_client):
    created = auth_client.post(
        LIST_URL,
        {"title": "Mine", "template_id": "classic", "document_data": get_empty_resume_document()},
        format="json",
    )
    assert created.status_code == 201
    rid = created.json()["id"]

    assert [r["id"] for r in auth_client.get(LIST_URL).json()] == [rid]

    patched = auth_client.patch(f"{LIST_URL}{rid}/", {"title": "Renamed"}, format="json")
    assert patched.status_code == 200
    assert patched.json()["title"] == "Renamed"

    assert auth_client.delete(f"{LIST_URL}{rid}/").status_code == 204
    assert auth_client.get(LIST_URL).json() == []


def test_invalid_document_is_rejected(auth_client):
    response = auth_client.post(
        LIST_URL, {"title": "Bad", "document_data": {"nope": 1}}, format="json"
    )
    assert response.status_code == 400


def test_users_cannot_access_each_others_resumes(auth_client, other_client, user):
    resume = Resume.objects.create(user=user, title="Private")
    assert other_client.get(LIST_URL).json() == []
    assert other_client.get(f"{LIST_URL}{resume.id}/").status_code == 404
    assert other_client.patch(f"{LIST_URL}{resume.id}/", {"title": "x"}, format="json").status_code == 404
    assert other_client.delete(f"{LIST_URL}{resume.id}/").status_code == 404
    assert Resume.objects.filter(pk=resume.pk).exists()
