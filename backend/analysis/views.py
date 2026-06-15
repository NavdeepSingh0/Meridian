"""
API Views for the analysis app.

These endpoints receive JSON payloads, validate the resume structure,
call the service layer, and serialize the resulting Pydantic models to JSON.
"""
import jsonschema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from resumes.schema import validate_resume_document
from analysis import services


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
            pdf_bytes = render_resume_pdf(resume_data, template_id)
            
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
