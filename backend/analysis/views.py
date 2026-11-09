"""
API Views for the analysis app.

These endpoints receive JSON payloads, validate the resume structure,
call the service layer, and serialize the resulting Pydantic models to JSON.

Credit model: one credit is reserved *before* the (expensive) AI call and
refunded if the call fails, so users are never charged for a failed request
and never get a free AI call by racing the deduction.
"""
import logging
from contextlib import contextmanager

import jsonschema
from django.db import transaction
from django.http import HttpResponse
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from analysis import services
from core.models import Profile
from resumes.schema import validate_resume_document

logger = logging.getLogger(__name__)

MAX_PDF_BYTES = 5 * 1024 * 1024  # 5 MB — matches the frontend dropzone limit
PDF_MAGIC = b"%PDF-"
VALID_TEMPLATES = ("classic", "modern", "minimal")


class OutOfCreditsError(Exception):
    """Raised when a non-premium user has no AI credits left."""


def _has_unlimited_credits(profile: Profile) -> bool:
    return profile.is_admin or profile.is_premium


def _reserve_credit(user) -> bool:
    """
    Atomically take one credit. Returns True if a credit was taken (and so
    must be refunded on failure), False for premium/admin users.
    Raises OutOfCreditsError when the balance is zero.
    """
    profile, _ = Profile.objects.get_or_create(user=user)
    if _has_unlimited_credits(profile):
        return False

    with transaction.atomic():
        locked = Profile.objects.select_for_update().get(pk=profile.pk)
        if locked.ai_credits <= 0:
            raise OutOfCreditsError("You have run out of AI credits. Please upgrade your plan.")
        locked.ai_credits -= 1
        locked.save(update_fields=["ai_credits"])
    return True


def _refund_credit(user) -> None:
    with transaction.atomic():
        locked = Profile.objects.select_for_update().get(user=user)
        locked.ai_credits += 1
        locked.save(update_fields=["ai_credits"])


@contextmanager
def credit_charged(user):
    """Reserve a credit for the duration of the block; refund it if the block raises."""
    charged = _reserve_credit(user)
    try:
        yield
    except BaseException:
        if charged:
            _refund_credit(user)
        raise


def _out_of_credits_response(exc: OutOfCreditsError) -> Response:
    return Response({"error": str(exc)}, status=status.HTTP_402_PAYMENT_REQUIRED)


def _service_error_response(exc: Exception) -> Response | None:
    """Translate service-layer exceptions into HTTP responses."""
    if isinstance(exc, services.SafetyError):
        return Response({"error": str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    if isinstance(exc, services.TimeoutOrUnavailableError):
        return Response(
            {"error": "AI analysis is taking longer than expected — please try again."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    if isinstance(exc, services.BadRequestError):
        return Response(
            {"error": "Internal AI integration error."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    return None


def _schema_error_response(exc: jsonschema.ValidationError) -> Response:
    path = " → ".join(str(p) for p in exc.absolute_path) if exc.absolute_path else "root"
    return Response(
        {"error": f"Schema validation failed at '{path}': {exc.message}"},
        status=status.HTTP_400_BAD_REQUEST,
    )


class AIView(APIView):
    """Base for endpoints that cost AI credits: authenticated + rate limited."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai"


class CritiqueView(AIView):
    """
    POST /api/analysis/critique/
    Body: { "resume_data": {...} }
    """

    def post(self, request, *args, **kwargs):
        resume_data = request.data.get("resume_data")
        if not resume_data:
            return Response({"error": "resume_data is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_resume_document(resume_data)
        except jsonschema.ValidationError as exc:
            return _schema_error_response(exc)

        try:
            with credit_charged(request.user):
                result = services.generate_critique(resume_data)
        except OutOfCreditsError as exc:
            return _out_of_credits_response(exc)
        except Exception as exc:
            response = _service_error_response(exc)
            if response:
                return response
            raise

        return Response(result.model_dump(), status=status.HTTP_200_OK)


class ATSScoreView(AIView):
    """
    POST /api/analysis/ats-score/
    Body: { "resume_data": {...}, "job_description": "..." (optional) }
    """

    def post(self, request, *args, **kwargs):
        resume_data = request.data.get("resume_data")
        job_description = request.data.get("job_description", "")
        if not resume_data:
            return Response({"error": "resume_data is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_resume_document(resume_data)
        except jsonschema.ValidationError as exc:
            return _schema_error_response(exc)

        # Treat empty/whitespace string as "no job description"
        jd = job_description if str(job_description).strip() else None

        try:
            with credit_charged(request.user):
                result = services.compute_ats_score(resume_data, jd)
        except OutOfCreditsError as exc:
            return _out_of_credits_response(exc)
        except Exception as exc:
            response = _service_error_response(exc)
            if response:
                return response
            raise

        return Response(result.model_dump(), status=status.HTTP_200_OK)


class ApplySuggestionView(AIView):
    """
    POST /api/analysis/apply-suggestion/
    Body: { "section_name": "...", "section_data": ..., "suggestion": "..." }
    """

    def post(self, request, *args, **kwargs):
        section_name = request.data.get("section_name")
        section_data = request.data.get("section_data")
        suggestion = request.data.get("suggestion")

        if not section_name or section_data is None or not suggestion:
            return Response(
                {"error": "section_name, section_data, and suggestion are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with credit_charged(request.user):
                rewritten_json_str = services.apply_suggestion(section_name, section_data, suggestion)
        except OutOfCreditsError as exc:
            return _out_of_credits_response(exc)
        except Exception as exc:
            response = _service_error_response(exc)
            if response:
                return response
            raise

        return Response({"rewritten_section_json": rewritten_json_str}, status=status.HTTP_200_OK)


class GenerateTextView(AIView):
    """
    POST /api/analysis/generate/
    Body: { "kind": "summary"|"bullet", "resume_data": {...}, "job_description": "...", "context": {...} }
    Returns: { "text": "..." }
    """

    def post(self, request, *args, **kwargs):
        kind = request.data.get("kind")
        resume_data = request.data.get("resume_data")
        job_description = request.data.get("job_description") or ""
        context = request.data.get("context")

        if kind not in ("summary", "bullet"):
            return Response({"error": "kind must be 'summary' or 'bullet'."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(resume_data, dict):
            return Response({"error": "resume_data is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_resume_document(resume_data)
        except jsonschema.ValidationError as exc:
            return _schema_error_response(exc)

        try:
            with credit_charged(request.user):
                text = services.generate_text(kind, resume_data, job_description, context)
        except OutOfCreditsError as exc:
            return _out_of_credits_response(exc)
        except Exception as exc:
            response = _service_error_response(exc)
            if response:
                return response
            raise

        return Response({"text": text}, status=status.HTTP_200_OK)


class ExportPDFView(APIView):
    """
    POST /api/analysis/export-pdf/
    Body: { "resume_data": {...}, "template_id": "classic|modern|minimal" }
    """

    def post(self, request, *args, **kwargs):
        resume_data = request.data.get("resume_data")
        template_id = request.data.get("template_id")
        settings = request.data.get("settings") or {"font_size": 10, "document_margin": 1}

        if not resume_data or not isinstance(resume_data, dict):
            return Response({"detail": "Invalid or missing resume_data"}, status=status.HTTP_400_BAD_REQUEST)

        if template_id not in VALID_TEMPLATES:
            return Response(
                {"detail": f"Invalid or missing template_id. Must be one of {', '.join(VALID_TEMPLATES)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_resume_document(resume_data)
        except jsonschema.ValidationError as e:
            return Response({"detail": f"Schema validation failed: {e.message}"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pdf_bytes = services.render_resume_pdf(resume_data, template_id, settings)
        except NotImplementedError as e:
            return Response({"detail": str(e)}, status=status.HTTP_501_NOT_IMPLEMENTED)
        except Exception:
            logger.exception("PDF export failed")
            return Response(
                {"detail": "We couldn't generate the PDF. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Build a header-safe filename from the resume name
        raw_name = (resume_data.get("basics") or {}).get("name") or "resume"
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in raw_name.strip()) or "resume"
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{safe_name}.pdf"'
        return response


class ParsePDFView(AIView):
    """
    POST /api/analysis/parse-pdf/
    Accepts: multipart/form-data with a 'file' field containing a PDF.
    Returns: { "resume_data": {...} } parsed from the PDF.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        upload = request.FILES.get("file")
        if upload is None:
            return Response({"detail": "A PDF file is required (field name: 'file')."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > MAX_PDF_BYTES:
            return Response({"detail": "PDF is too large. The maximum size is 5 MB."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

        pdf_bytes = upload.read()
        if not pdf_bytes.startswith(PDF_MAGIC):
            return Response({"detail": "That file doesn't look like a PDF."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with credit_charged(request.user):
                resume_data = services.parse_resume_pdf_upload(pdf_bytes)
        except OutOfCreditsError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_402_PAYMENT_REQUIRED)
        except services.ScannedPDFError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception:
            logger.exception("PDF parse failed")
            return Response(
                {"detail": "We couldn't read that PDF. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"resume_data": resume_data}, status=status.HTTP_200_OK)
