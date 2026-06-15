from django.urls import path
from analysis.views import CritiqueView, ATSScoreView, ExportPDFView

urlpatterns = [
    path("critique/", CritiqueView.as_view(), name="analysis-critique"),
    path("ats-score/", ATSScoreView.as_view(), name="analysis-ats-score"),
    path("export-pdf/", ExportPDFView.as_view(), name="analysis-export-pdf"),
]
