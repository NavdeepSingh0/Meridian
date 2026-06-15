"""
URL configuration for the Meridian API backend.
"""
from django.urls import path, include

urlpatterns = [
    path("api/resumes/", include("resumes.urls")),
    path("api/analysis/", include("analysis.urls")),
]
