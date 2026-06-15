"""
Serializers for the `resumes` app.

Schema validation is the key responsibility here — `document_data` is
validated against the §6.2 JSON Schema before any database write.
"""
import jsonschema
from rest_framework import serializers

from resumes.models import Resume
from resumes.schema import validate_resume_document


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ["id", "title", "template_id", "document_data", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_document_data(self, value: dict) -> dict:
        """
        Validate `document_data` against the locked §6.2 JSON Resume schema.

        Returns a 400 with the specific validation error message (field path + reason)
        rather than a raw stack trace on failure.
        """
        try:
            validate_resume_document(value)
        except jsonschema.ValidationError as exc:
            # Build a clean, human-readable error path
            path = " → ".join(str(p) for p in exc.absolute_path) if exc.absolute_path else "root"
            raise serializers.ValidationError(
                f"Schema validation failed at '{path}': {exc.message}"
            ) from exc
        return value
