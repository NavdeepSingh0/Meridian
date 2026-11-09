"""
JSON Resume-derived schema (§6.2 — LOCKED).

This module encodes the canonical schema for all resume data in this application.
It is the single source of truth for:
  - Django model validation (via jsonschema)
  - DRF serializer validation
  - Analysis endpoint input validation
  - Frontend TypeScript types (which must be kept in sync manually)

Do not modify this schema without updating ARCHITECTURE.md §6 first.
"""
from typing import Any

RESUME_SCHEMA: dict[str, Any] = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "MeridianResume",
    "type": "object",
    "required": [
        "basics",
        "work",
        "education",
        "skills",
        "projects",
        "certificates",
        "volunteer",
        "awards",
        "publications",
        "languages",
        "interests",
        "references",
    ],
    "additionalProperties": False,
    "properties": {
        "basics": {
            "type": "object",
            "required": ["name"],
            "properties": {
                "name": {"type": "string"},
                "label": {"type": "string"},
                "email": {"type": "string"},
                "phone": {"type": "string"},
                "url": {"type": "string"},
                "summary": {"type": "string"},
                "location": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string"},
                        "region": {"type": "string"},
                        "countryCode": {"type": "string"},
                    },
                },
                "profiles": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "network": {"type": "string"},
                            "username": {"type": "string"},
                            "url": {"type": "string"},
                        },
                    },
                },
            },
        },
        "work": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "position": {"type": "string"},
                    "startDate": {"type": "string"},
                    "endDate": {"type": "string"},
                    "summary": {"type": "string"},
                    "highlights": {"type": "array", "items": {"type": "string"}},
                },
            },
        },
        "education": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "institution": {"type": "string"},
                    "studyType": {"type": "string"},
                    "area": {"type": "string"},
                    "startDate": {"type": "string"},
                    "endDate": {"type": "string"},
                    "score": {"type": "string"},
                },
            },
        },
        "projects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "highlights": {"type": "array", "items": {"type": "string"}},
                    "keywords": {"type": "array", "items": {"type": "string"}},
                    "url": {"type": "string"},
                },
            },
        },
        "skills": {
            "type": "array",
            # NOTE: No `level` field per §6.4
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "keywords": {"type": "array", "items": {"type": "string"}},
                },
            },
        },
        "certificates": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "date": {"type": "string"},
                    "issuer": {"type": "string"},
                    "url": {"type": "string"},
                },
            },
        },
        # Stub sections — present for JSON Resume compatibility, no UI in v1 (§6.3)
        "volunteer": {"type": "array"},
        "awards": {"type": "array"},
        "publications": {"type": "array"},
        "languages": {"type": "array"},
        "interests": {"type": "array"},
        "references": {"type": "array"},
    },
}


def get_empty_resume_document() -> dict[str, Any]:
    """
    Return a fully-keyed, schema-valid, empty resume document.

    This is the default used when creating a new Resume model instance
    and should match the TypeScript default in lib/store/resumeStore.ts.
    Every top-level key is always present — 'empty' means arrays are []
    and strings are '', not that keys are missing.
    """
    return {
        "basics": {
            "name": "",
            "label": "",
            "email": "",
            "phone": "",
            "url": "",
            "summary": "",
            "location": {
                "city": "",
                "region": "",
                "countryCode": "",
            },
            "profiles": [],
        },
        "work": [],
        "education": [],
        "projects": [],
        "skills": [],
        "certificates": [],
        "volunteer": [],
        "awards": [],
        "publications": [],
        "languages": [],
        "interests": [],
        "references": [],
    }


def validate_resume_document(data: Any) -> None:
    """
    Validate a resume document against RESUME_SCHEMA.

    Raises jsonschema.ValidationError with a human-readable message
    (field path + reason) if validation fails.

    Usage in serializers:
        from resumes.schema import validate_resume_document
        try:
            validate_resume_document(value)
        except jsonschema.ValidationError as e:
            raise serializers.ValidationError(str(e.message))
    """
    import jsonschema

    jsonschema.validate(instance=data, schema=RESUME_SCHEMA)


def _coerce(value: Any, schema: dict[str, Any]) -> Any:
    """Best-effort coercion of `value` to match `schema` (see normalize_resume_document)."""
    kind = schema.get("type")

    if kind == "object":
        props = schema.get("properties", {})
        source = value if isinstance(value, dict) else {}
        out: dict[str, Any] = {}
        for key, item in source.items():
            if key in props:
                out[key] = _coerce(item, props[key])
            elif schema.get("additionalProperties") is not False:
                out[key] = item  # tolerate extra fields (e.g. work[].location)
        return out

    if kind == "array":
        items_schema = schema.get("items")
        source = value if isinstance(value, list) else []
        if not items_schema:
            return source
        if items_schema.get("type") == "object":
            # Drop entries that are not objects at all (e.g. a stray string in `work`).
            source = [v for v in source if isinstance(v, dict)]
        return [_coerce(v, items_schema) for v in source]

    if kind == "string":
        if value is None:
            return ""
        if isinstance(value, str):
            return value
        if isinstance(value, (list, tuple)):
            return ", ".join(str(v) for v in value if v is not None)
        return str(value)

    return value


def normalize_resume_document(data: Any) -> dict[str, Any]:
    """
    Coerce an untrusted/LLM-produced resume dict into a schema-valid document.

    LLMs routinely return `null` for missing strings, numbers for years, or omit
    keys entirely. Rather than reject the whole resume, this fills missing
    top-level keys, turns null/non-string scalars into strings, drops unknown
    top-level keys and non-object list entries, and guarantees the result passes
    `validate_resume_document`.
    """
    result = _coerce(data if isinstance(data, dict) else {}, RESUME_SCHEMA)
    empty = get_empty_resume_document()

    for key in RESUME_SCHEMA["required"]:
        if key not in result:
            result[key] = empty[key]

    # `basics` must at least have a name, and keep the full shape the editor expects.
    basics = {**empty["basics"], **result["basics"]}
    basics["location"] = {**empty["basics"]["location"], **(basics.get("location") or {})}
    result["basics"] = basics
    return result
