"""
Service layer for AI analysis and PDF rendering.

Integrates with the `google-genai` client, implementing the full defensive
parsing pipeline, error handling hierarchy, and fallback to mock data
described in ARCHITECTURE.md §8.6 and §8.7.
"""
import time
import json
import logging
from typing import Any, Optional, TypeVar, Type

from pydantic import BaseModel, ValidationError
from groq import GroqError, APIError

from analysis.schemas import CritiqueResult, ATSResult
from analysis.mock_data import get_mock_critique, get_mock_ats_result
from analysis.groq_client import client, is_demo_mode
from analysis.prompts import (
    CRITIQUE_SYSTEM_PROMPT,
    ATS_SYSTEM_PROMPT,
    build_critique_user_message,
    build_ats_user_message,
)


logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class SafetyError(Exception):
    """Raised when Gemini blocks content due to safety filters (422)."""
    pass

class TimeoutOrUnavailableError(Exception):
    """Raised when Gemini returns 504 or times out (503)."""
    pass

class BadRequestError(Exception):
    """Raised when Gemini returns a 400 error (500)."""
    pass

def _clean_json_string(raw_text: str) -> str:
    """Strip markdown code fences from Gemini output."""
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[len("```json"):]
    elif text.startswith("```"):
        text = text[len("```"):]
    
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _call_gemini_and_parse(
    system_instruction: str, 
    user_message: str, 
    response_schema: Type[T]
) -> T | None:
    """
    Core defensive pipeline for calling Groq and parsing structured output.
    Returns the parsed Pydantic model on success.
    Returns None on conditions that should trigger a mock fallback (429, parse failure).
    Raises specific Exceptions for conditions that should surface to the frontend (Safety, 504, 400).
    """
    system_instruction += f"\n\nYou must output a JSON object that strictly adheres to the following JSON schema:\n{json.dumps(response_schema.model_json_schema(), indent=2)}"
    max_retries = 3
    base_delay = 2
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_instruction,
                    },
                    {
                        "role": "user",
                        "content": user_message,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.2, # Low temp for structured extraction/evaluation
                response_format={"type": "json_object"},
            )
            break # Success, exit retry loop
        except APIError as e:
            code = getattr(e, "status_code", getattr(e, "code", None))
            if code in [503, 504, 429]:
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Groq API {code} error. Retrying in {delay}s...")
                    time.sleep(delay)
                    continue
                logger.error(f"Groq API {code} error after {max_retries} attempts.")
                raise TimeoutOrUnavailableError()
            elif code == 400:
                logger.error(f"Groq API Bad Request (400): {getattr(e, 'message', str(e))}")
                raise BadRequestError()
            else:
                logger.error(f"Unknown Groq API Error {code}: {str(e)}")
                raise TimeoutOrUnavailableError()
        except GroqError as e:
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                logger.warning(f"Network timeout or unexpected error: {str(e)}. Retrying in {delay}s...")
                time.sleep(delay)
                continue
            logger.error(f"Network timeout or unexpected error calling Groq: {str(e)}")
            raise TimeoutOrUnavailableError()
        except Exception as e:
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                logger.warning(f"Network timeout or unexpected error: {str(e)}. Retrying in {delay}s...")
                time.sleep(delay)
                continue
            logger.error(f"Network timeout or unexpected error calling Groq: {str(e)}")
            raise TimeoutOrUnavailableError()

    # 1. Check finish_reason for Safety block
    if not response.choices:
        logger.error("Groq returned no choices.")
        return None # Fallback
        
    choice = response.choices[0]
    finish_reason = getattr(choice, "finish_reason", None)
    
    if str(finish_reason) == "content_filter":
        raise SafetyError("Content flagged by safety filters")

    # 2. Extract text and strip markdown
    raw_text = choice.message.content
    if not raw_text:
        logger.error("Groq returned empty text.")
        return None
        
    cleaned_text = _clean_json_string(raw_text)
    
    # 3. Parse JSON and validate with Pydantic
    try:
        parsed_dict = json.loads(cleaned_text)
        validated_model = response_schema.model_validate(parsed_dict)
        return validated_model
    except (json.JSONDecodeError, ValidationError) as e:
        logger.error(f"Failed to parse or validate Groq output: {str(e)}\nRaw output: {raw_text}")
        return None # Trigger mock fallback


def generate_critique(resume_data: dict[str, Any]) -> CritiqueResult:
    """
    Generate an AI critique for the provided resume.
    """
    if is_demo_mode():
        time.sleep(1.5)
        return get_mock_critique()

    user_message = build_critique_user_message(resume_data)
    
    result = _call_gemini_and_parse(
        system_instruction=CRITIQUE_SYSTEM_PROMPT,
        user_message=user_message,
        response_schema=CritiqueResult
    )
    
    if result is None:
        # Fallback due to 429 or parse failure
        return get_mock_critique()
        
    return result


def compute_ats_score(resume_data: dict[str, Any], job_description: Optional[str] = None) -> ATSResult:
    """
    Compute an ATS compatibility score, optionally diffing against a JD.
    """
    if is_demo_mode():
        time.sleep(1.5)
        return get_mock_ats_result(has_job_description=bool(job_description))

    user_message = build_ats_user_message(resume_data, job_description)
    
    result = _call_gemini_and_parse(
        system_instruction=ATS_SYSTEM_PROMPT,
        user_message=user_message,
        response_schema=ATSResult
    )
    
    if result is None:
        # Fallback due to 429 or parse failure
        return get_mock_ats_result(has_job_description=bool(job_description))
        
    return result


def apply_suggestion(section_name: str, section_data: Any, suggestion: str) -> str:
    """
    Rewrite a resume section to incorporate a constructive suggestion.
    Returns the raw rewritten JSON string.
    """
    if is_demo_mode():
        time.sleep(1.5)
        # Just return the input data unmodified in demo mode as fallback
        return json.dumps(section_data)

    from analysis.prompts import APPLY_SUGGESTION_SYSTEM_PROMPT, build_apply_suggestion_user_message
    from analysis.schemas import ApplySuggestionResult

    user_message = build_apply_suggestion_user_message(section_name, section_data, suggestion)
    
    result = _call_gemini_and_parse(
        system_instruction=APPLY_SUGGESTION_SYSTEM_PROMPT,
        user_message=user_message,
        response_schema=ApplySuggestionResult
    )
    
    if result is None:
        # Fallback
        return json.dumps(section_data)
        
    return result.rewritten_section_json




def render_resume_pdf(resume_data: dict, template_id: str) -> bytes:
    """
    Renders the given resume data into a PDF byte string.
    Uses Django's template engine to render HTML, then WeasyPrint to create PDF.
    Falls back to xhtml2pdf if WeasyPrint/GTK3 is unavailable.
    """
    from django.template.loader import render_to_string
    
    # Render the appropriate template
    template_name = f"analysis/pdf/{template_id}.html"
    html_string = render_to_string(template_name, {"resume": resume_data})
    
    try:
        from weasyprint import HTML
        # Generate the PDF bytes
        pdf_bytes = HTML(string=html_string).write_pdf()
        return pdf_bytes
    except Exception as e:
        logger.warning(f"WeasyPrint failed ({str(e)}). Falling back to xhtml2pdf.")
        # Fallback if WeasyPrint or GTK3 isn't available
        try:
            from xhtml2pdf import pisa
            import io
            result = io.BytesIO()
            pdf = pisa.pisaDocument(io.BytesIO(html_string.encode("utf-8")), result)
            if not pdf.err:
                return result.getvalue()
            else:
                raise Exception(f"xhtml2pdf error: {pdf.err}")
        except ImportError:
            raise NotImplementedError("WeasyPrint or its system dependencies (GTK3) are not installed, and xhtml2pdf fallback is not installed.")
