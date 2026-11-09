"""End-to-end test of PDF import through the real view + pdfplumber (LLM runs in demo mode)."""
import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

reportlab_canvas = pytest.importorskip("reportlab.pdfgen.canvas")


def _make_pdf(lines):
    buf = io.BytesIO()
    c = reportlab_canvas.Canvas(buf)
    y = 800
    for line in lines:
        c.drawString(72, y, line)
        y -= 18
    c.save()
    return buf.getvalue()


def test_text_pdf_is_parsed_through_real_endpoint(auth_client):
    pdf = _make_pdf(
        ["Jane Doe - Software Engineer"]
        + [f"Built and shipped service number {i} used by thousands of customers." for i in range(6)]
    )
    upload = SimpleUploadedFile("cv.pdf", pdf, content_type="application/pdf")
    response = auth_client.post(reverse("analysis-parse-pdf"), {"file": upload}, format="multipart")
    assert response.status_code == 200, response.content
    assert "basics" in response.json()["resume_data"]


def test_scanned_pdf_with_no_text_is_422(auth_client):
    upload = SimpleUploadedFile("scan.pdf", _make_pdf([]), content_type="application/pdf")
    response = auth_client.post(reverse("analysis-parse-pdf"), {"file": upload}, format="multipart")
    assert response.status_code == 422
