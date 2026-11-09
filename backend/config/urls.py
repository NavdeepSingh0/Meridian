"""
URL configuration for the Meridian API backend.
"""
import firebase_admin
from django.http import JsonResponse
from django.urls import include, path

from core.authentication import init_firebase


def healthz(request):
    """Public health check — confirms Firebase is initialised."""
    try:
        init_firebase()
    except RuntimeError:
        pass
    return JsonResponse({
        "status": "ok",
        "firebase_initialized": bool(firebase_admin._apps),
    })


urlpatterns = [
    path("healthz", healthz),
    path("api/auth/", include("core.urls")),
    path("api/resumes/", include("resumes.urls")),
    path("api/analysis/", include("analysis.urls")),
]
