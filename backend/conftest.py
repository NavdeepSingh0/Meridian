
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import Profile


@pytest.fixture(autouse=True)
def _demo_mode_and_no_throttle(settings):
    """Tests never hit the real LLM, and rate limits don't interfere."""
    settings.GROQ_API_KEY = ""
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_RATES": {"ai": "1000/min"},
    }


@pytest.fixture
def user(db):
    u = get_user_model().objects.create_user(username="firebase-uid-1", email="a@example.com")
    Profile.objects.create(user=u, ai_credits=3)
    return u


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client
