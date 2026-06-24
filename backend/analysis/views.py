"""
API Views for the analysis app.

These endpoints receive JSON payloads, validate the resume structure,
call the service layer, and serialize the resulting Pydantic models to JSON.
"""
import jsonschema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from resumes.schema import validate_resume_document
from resumes.schema import validate_resume_document
from analysis import services
from core.models import Profile

def _check_and_deduct_credits(user):
    """
    Checks if the user has enough credits or is premium/admin.
    If so, deducts 1 credit and returns True.
    If not, raises an Exception to be handled by the view.
    """
    if not user or not user.is_authenticated:
        raise PermissionError("You must be logged in to use AI analysis.")
        
    profile, _ = Profile.objects.get_or_create(user=user)
    
    if profile.is_admin or profile.is_premium:
        return True
        
    if profile.ai_credits > 0:
        profile.ai_credits -= 1
        profile.save(update_fields=["ai_credits"])
        return True
        
    raise ValueError("You have run out of AI credits. Please upgrade your plan.")


def _handle_service_errors(exc: Exception) -> Response | None:
    """Helper to translate service layer exceptions into HTTP responses."""
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


class CritiqueView(APIView):
    """
    POST /api/analysis/critique/
    Body: { "resume_data": {...} }
    """

    def post(self, request, *args, **kwargs):
        resume_data = request.data.get("resume_data")
        if not resume_data:
            return Response({"error": "resume_data is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            _check_and_deduct_credits(request.user)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Validate structure before sending to AI
        try:
            validate_resume_document(resume_data)
        except jsonschema.ValidationError as exc:
            path = " → ".join(str(p) for p in exc.absolute_path) if exc.absolute_path else "root"
            return Response(
                {"error": f"Schema validation failed at '{path}': {exc.message}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = services.generate_critique(resume_data)
        except Exception as exc:
            err_response = _handle_service_errors(exc)
            if err_response:
                return err_response
            raise  # Unhandled exception, let Django return 500
        
        return Response(result.model_dump(), status=status.HTTP_200_OK)


class ATSScoreView(APIView):
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
            _check_and_deduct_credits(request.user)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)

        try:
            validate_resume_document(resume_data)
        except jsonschema.ValidationError as exc:
            path = " → ".join(str(p) for p in exc.absolute_path) if exc.absolute_path else "root"
            return Response(
                {"error": f"Schema validation failed at '{path}': {exc.message}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Treat empty string as None
        jd = job_description if str(job_description).strip() else None

        try:
            result = services.compute_ats_score(resume_data, jd)
        except Exception as exc:
            err_response = _handle_service_errors(exc)
            if err_response:
                return err_response
            raise

        return Response(result.model_dump(), status=status.HTTP_200_OK)


class ApplySuggestionView(APIView):
    """
    POST /api/analysis/apply-suggestion/
    Body: { "section_name": "...", "section_data": ..., "suggestion": "..." }
    """

    def post(self, request, *args, **kwargs):
        section_name = request.data.get("section_name")
        section_data = request.data.get("section_data")
        suggestion = request.data.get("suggestion")
        
        if not section_name or section_data is None or not suggestion:
            return Response({"error": "section_name, section_data, and suggestion are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            _check_and_deduct_credits(request.user)
        except PermissionError as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)

        try:
            # Returns a raw JSON string
            rewritten_json_str = services.apply_suggestion(section_name, section_data, suggestion)
            return Response({"rewritten_section_json": rewritten_json_str}, status=status.HTTP_200_OK)
        except Exception as exc:
            err_response = _handle_service_errors(exc)
            if err_response:
                return err_response
            raise


class ExportPDFView(APIView):
    """
    POST /api/analysis/export-pdf/
    Body: { "resume_data": {...}, "template_id": "classic|modern|minimal" }
    """

    def post(self, request, *args, **kwargs):
        resume_data = request.data.get("resume_data")
        template_id = request.data.get("template_id")
        settings = request.data.get("settings", {"font_size": 10, "document_margin": 1})
        
        if not resume_data or not isinstance(resume_data, dict):
            return Response({"detail": "Invalid or missing resume_data"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not template_id or template_id not in ["classic", "modern", "minimal"]:
            return Response({"detail": "Invalid or missing template_id. Must be one of 'classic', 'modern', 'minimal'."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            validate_resume_document(resume_data)
        except jsonschema.ValidationError as e:
            return Response({"detail": f"Schema validation failed: {e.message}"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from analysis.services import render_resume_pdf
            pdf_bytes = render_resume_pdf(resume_data, template_id, settings)
            
            # Use Django's HttpResponse to send bytes natively
            from django.http import HttpResponse
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            # Use a safe filename from the resume
            name = resume_data.get("basics", {}).get("name", "resume").replace(" ", "_")
            response['Content-Disposition'] = f'attachment; filename="{name}.pdf"'
            return response
            
        except NotImplementedError as e:
            return Response({"detail": str(e)}, status=status.HTTP_501_NOT_IMPLEMENTED)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"detail": f"An error occurred while generating the PDF: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ParsePDFView(APIView):
    """
    POST /api/analysis/parse-pdf/
    Accepts: multipart/form-data with a 'file' field containing a PDF.
    Returns: { "resume_data": {...} } parsed from the PDF.
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        from analysis.services import parse_resume_pdf_upload, ScannedPDFError

        try:
            _check_and_deduct_credits(request.user)
        except PermissionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Validate file present
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        name = uploaded_file.name or ""
        if not name.lower().endswith(".pdf"):
            return Response({"detail": "Only PDF files are accepted."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if uploaded_file.size > max_size:
            return Response({"detail": "File too large (max 5MB)."}, status=status.HTTP_400_BAD_REQUEST)

        pdf_bytes = uploaded_file.read()

        try:
            resume_data = parse_resume_pdf_upload(pdf_bytes)
            return Response({"resume_data": resume_data}, status=status.HTTP_200_OK)
        except ScannedPDFError as e:
            return Response({"detail": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"An error occurred while parsing the PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
