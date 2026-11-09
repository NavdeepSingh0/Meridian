"""Service-layer tests for the Groq pipeline (client is mocked; no network)."""
import json
from unittest.mock import MagicMock

import pytest
from groq import APIError

from analysis import services
from analysis.schemas import CritiqueResult
from resumes.schema import get_empty_resume_document

VALID_CRITIQUE = {
    "overall_score": 85,
    "overall_feedback": "Great resume.",
    "sections": [
        {"section": "work", "score": 80, "strengths": ["Good"], "improvements": ["More detail"]}
    ],
}


@pytest.fixture
def empty_resume():
    return get_empty_resume_document()


@pytest.fixture
def groq(mocker):
    client = MagicMock()
    mocker.patch("analysis.services.client", client)
    mocker.patch("analysis.services.is_demo_mode", return_value=False)
    mocker.patch("analysis.services.time.sleep")  # don't actually back off
    return client


def llm_response(content, finish_reason="stop"):
    response = MagicMock()
    response.choices = [MagicMock(finish_reason=finish_reason, message=MagicMock(content=content))]
    return response


def api_error(code):
    err = APIError("boom", request=MagicMock(), body=None)
    err.status_code = code
    return err


def test_success_parses_fenced_json(groq, empty_resume):
    groq.chat.completions.create.return_value = llm_response(f"```json\n{json.dumps(VALID_CRITIQUE)}\n```")
    result = services.generate_critique(empty_resume)
    assert isinstance(result, CritiqueResult)
    assert result.overall_score == 85


def test_content_filter_raises_safety_error(groq, empty_resume):
    groq.chat.completions.create.return_value = llm_response("x", finish_reason="content_filter")
    with pytest.raises(services.SafetyError):
        services.generate_critique(empty_resume)


def test_non_json_output_falls_back_to_mock(groq, empty_resume):
    groq.chat.completions.create.return_value = llm_response("This is not JSON at all.")
    assert services.generate_critique(empty_resume).overall_score == 78


def test_rate_limit_retries_then_succeeds(groq, empty_resume):
    groq.chat.completions.create.side_effect = [
        api_error(429),
        llm_response(json.dumps(VALID_CRITIQUE)),
    ]
    assert services.generate_critique(empty_resume).overall_score == 85
    assert groq.chat.completions.create.call_count == 2


def test_persistent_rate_limit_raises_unavailable(groq, empty_resume):
    groq.chat.completions.create.side_effect = api_error(429)
    with pytest.raises(services.TimeoutOrUnavailableError):
        services.generate_critique(empty_resume)
    assert groq.chat.completions.create.call_count == 3


def test_bad_request_raises_bad_request_error(groq, empty_resume):
    groq.chat.completions.create.side_effect = api_error(400)
    with pytest.raises(services.BadRequestError):
        services.generate_critique(empty_resume)
