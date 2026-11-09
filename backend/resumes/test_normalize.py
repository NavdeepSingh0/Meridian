import json
from unittest.mock import MagicMock

import pytest

from analysis import services
from resumes.schema import (
    get_empty_resume_document,
    normalize_resume_document,
    validate_resume_document,
)

# What an LLM realistically returns: nulls, numbers, missing keys, extra keys, junk entries.
MESSY = {
    "basics": {"name": "Jane Doe", "email": None, "phone": 5551234, "location": None, "profiles": None},
    "work": [
        {"name": "Acme", "position": "Engineer", "startDate": "01/2020", "endDate": None, "highlights": None},
        "not an object",
    ],
    "education": [{"institution": "MIT", "score": 3.9}],
    "skills": [{"name": "Languages", "keywords": "Python"}],
    "invented_section": {"x": 1},
}


def test_messy_llm_output_is_normalised_to_valid_schema():
    result = normalize_resume_document(MESSY)
    validate_resume_document(result)  # must not raise

    assert result["basics"]["email"] == ""
    assert result["basics"]["phone"] == "5551234"
    assert result["basics"]["location"] == {"city": "", "region": "", "countryCode": ""}
    assert len(result["work"]) == 1  # junk entry dropped
    assert result["work"][0]["endDate"] == ""
    assert result["work"][0]["highlights"] == []
    assert result["education"][0]["score"] == "3.9"
    assert "invented_section" not in result
    assert result["volunteer"] == []  # missing top-level keys filled


@pytest.mark.parametrize("garbage", [None, [], "text", 42, {}])
def test_garbage_input_yields_an_empty_valid_document(garbage):
    result = normalize_resume_document(garbage)
    validate_resume_document(result)
    assert result == get_empty_resume_document()


def test_valid_documents_pass_through_unchanged():
    doc = get_empty_resume_document()
    doc["basics"]["name"] = "Ada"
    doc["work"] = [{"name": "X", "position": "Y", "highlights": ["did a thing"]}]
    assert normalize_resume_document(doc) == doc


def test_extra_nested_fields_the_editor_uses_are_preserved():
    doc = get_empty_resume_document()
    doc["work"] = [{"name": "X", "location": "Remote"}]
    assert normalize_resume_document(doc)["work"][0]["location"] == "Remote"


def test_parse_pipeline_returns_schema_valid_data_from_messy_llm_output(mocker):
    """parse_resume_pdf_upload end to end, with pdfplumber + the LLM mocked."""
    mocker.patch("analysis.services.is_demo_mode", return_value=False)

    page = MagicMock()
    page.extract_text.return_value = "Jane Doe Software Engineer. " * 20
    pdf = MagicMock(pages=[page])
    pdf.__enter__.return_value = pdf
    mocker.patch("pdfplumber.open", return_value=pdf)

    client = MagicMock()
    client.chat.completions.create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content=json.dumps(MESSY)))]
    )
    mocker.patch("analysis.services.client", client)

    result = services.parse_resume_pdf_upload(b"%PDF-1.4")
    validate_resume_document(result)
    assert result["basics"]["name"] == "Jane Doe"
