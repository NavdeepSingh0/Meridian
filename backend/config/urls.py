"""
URL configuration for the Meridian API backend.
"""
import firebase_admin
from django.urls import path, include
from django.http import JsonResponse

def healthz(request):
    """Public health check — confirms Firebase init status and code version."""
    firebase_ok = bool(firebase_admin._apps)
    return JsonResponse({
        "status": "ok",
        "firebase_initialized": firebase_ok,
        "version": "2026-06-24-v3",  # bump this on each deploy to confirm code is fresh
    })

urlpatterns = [
    path("healthz", healthz),
    path("api/auth/", include("core.urls")),
    path("api/resumes/", include("resumes.urls")),
    path("api/analysis/", include("analysis.urls")),
]
