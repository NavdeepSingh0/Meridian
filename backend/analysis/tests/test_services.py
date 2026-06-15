import pytest
import json
from unittest.mock import MagicMock

from google.genai.errors import APIError
from pydantic import ValidationError

from analysis import services
from analysis.schemas import CritiqueResult
from resumes.schema import get_empty_resume_document

@pytest.fixture
def empty_resume():
    return get_empty_resume_document()

@pytest.fixture
def mock_genai_client(mocker):
    # Mock the `client` in analysis.services
    mock_client = MagicMock()
    mocker.patch("analysis.services.client", mock_client)
    # Also mock is_demo_mode to be False so we actually test the pipeline
    mocker.patch("analysis.services.is_demo_mode", return_value=False)
    return mock_client

def test_gemini_success(mock_genai_client, empty_resume):
    # Setup mock response
    mock_response = MagicMock()
    mock_candidate = MagicMock()
    mock_candidate.finish_reason = "STOP"
    mock_response.candidates = [mock_candidate]
    
    valid_json = {
        "overall_score": 85,
        "overall_feedback": "Great resume.",
        "sections": [
            {
                "section": "work",
                "score": 80,
                "strengths": ["Good"],
                "improvements": ["More detail"]
            }
        ]
    }
    mock_response.text = f"```json\n{json.dumps(valid_json)}\n```"
    mock_genai_client.models.generate_content.return_value = mock_response
    
    result = services.generate_critique(empty_resume)
    
    assert isinstance(result, CritiqueResult)
    assert result.overall_score == 85
    assert len(result.sections) == 1

def test_gemini_safety_block(mock_genai_client, empty_resume):
    mock_response = MagicMock()
    mock_candidate = MagicMock()
    mock_candidate.finish_reason = "SAFETY"
    mock_response.candidates = [mock_candidate]
    mock_genai_client.models.generate_content.return_value = mock_response
    
    with pytest.raises(services.SafetyError):
        services.generate_critique(empty_resume)

def test_gemini_429_fallback(mock_genai_client, empty_resume):
    # Simulate a 429 rate limit error
    error = APIError("Rate limited", response=MagicMock())
    error.code = 429
    mock_genai_client.models.generate_content.side_effect = error
    
    result = services.generate_critique(empty_resume)
    # Should fallback to mock data
    assert isinstance(result, CritiqueResult)
    # Assuming mock data score is 78
    assert result.overall_score == 78

def test_gemini_parse_failure_fallback(mock_genai_client, empty_resume):
    mock_response = MagicMock()
    mock_candidate = MagicMock()
    mock_candidate.finish_reason = "STOP"
    mock_response.candidates = [mock_candidate]
    mock_response.text = "This is not JSON at all."
    mock_genai_client.models.generate_content.return_value = mock_response
    
    result = services.generate_critique(empty_resume)
    # Should fallback to mock data
    assert isinstance(result, CritiqueResult)
    assert result.overall_score == 78
