"""
Resume model — stores a resume document as a validated JSONField.

Design decisions (from §12.2, §7.1):
- A single JSONField (`document_data`) holds the full §6.2-compliant resume object.
  This eliminates 6-8 relational tables while keeping full schema validation.
- `session_key` provides lightweight per-browser resume ownership without auth (§12.2).
- Inherits `created_at` / `updated_at` from TimeStampedModel (§7.1).

Template IDs: "classic", "modern", "minimal" (matching Stitch design spec).
"""
from django.db import models
from django.contrib.auth import get_user_model

from core.models import TimeStampedModel
from resumes.schema import get_empty_resume_document

User = get_user_model()


class Resume(TimeStampedModel):
    """
    A single resume document with its chosen template.

    Ownership is tracked by `session_key` — a Django session key that
    identifies the browser that created this resume, without requiring
    user accounts. This is the v1 persistence stretch goal (§12.2).
    The primary persistence path is localStorage (§12.1).
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="resumes",
        help_text="The authenticated user who owns this resume. Null for guest sessions.",
    )
    title = models.CharField(
        max_length=255,
        default="My Resume",
        help_text="A human-readable label for this resume (e.g., 'Software Engineer Resume').",
    )
    # Expected values: "classic", "modern", "minimal" — stored as plain CharField
    # to avoid migration overhead if template names change during development.
    template_id = models.CharField(
        max_length=50,
        default="classic",
        help_text="The visual template to use when rendering this resume.",
    )
    document_data = models.JSONField(
        default=get_empty_resume_document,
        help_text="Full §6.2-compliant JSON Resume document. Validated on API write.",
    )
    session_key = models.CharField(
        max_length=40,
        blank=True,
        db_index=True,
        help_text="Django session key of the browser that created this resume.",
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        name = self.document_data.get("basics", {}).get("name", "")
        return f"{self.title} — {name}" if name else self.title
