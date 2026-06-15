# SKILL: Backend Development for Meridian (Django + DRF + Gemini + WeasyPrint)

**Audience:** Antigravity IDE (autonomous implementation agent)
**Purpose:** This document is the complete, step-by-step backend build guide for the Meridian resume builder's Django backend. It assumes `ARCHITECTURE.md` has already been read and its decisions are locked — this file translates those decisions into an ordered, detailed implementation path. No code is provided here; every section describes *what* to build, *why*, *in what order*, and *what "done" looks like* for that step, so that implementation choices remain consistent with the architecture even where this document doesn't spell out exact syntax.

**Core principle to hold throughout:** build the *shape* of the system first with mocked/stubbed AI and PDF behavior, then fill in real Gemini calls and real WeasyPrint rendering last. At every stage, the application should be runnable and the API should return *something* schema-correct, even before AI integration is real. This lets the frontend integrate against stable contracts from day one.

---

## Part 0 — Before You Start

Read `ARCHITECTURE.md` in full, especially:
- §6 (the locked JSON Resume-derived schema) — this is the single most important section. Every model field, serializer, prompt, and PDF template must conform to this shape exactly. Do not invent additional top-level keys or rename existing ones.
- §7 (Django app structure and service layer pattern)
- §8 (AI integration architecture, error handling hierarchy, Pydantic schemas)
- §9.7, §6.6 (the right-panel state machine and highlighting granularity — these affect what shape the `CritiqueResult` needs to be in)
- §10–§11 (template system and PDF export)
- §13–§14 (testing and secrets)

If anything in this SKILL file appears to contradict `ARCHITECTURE.md`, `ARCHITECTURE.md` wins — flag the discrepancy rather than silently picking one.

---

## Part 1 — Project Scaffold

### 1.1 Directory and Project Setup

Create the Django project inside `apps/api/` with the project package named `config` (not the Django default name). Inside `config/`, set up a `settings/` package (not a single `settings.py`) with `base.py`, `dev.py`, and `prod.py` as described in §5.3. `base.py` holds everything common; `dev.py` imports from `base` and adds development-specific settings (e.g., `DEBUG = True`, permissive `ALLOWED_HOSTS`, SQLite database). `prod.py` exists as a placeholder for now — it doesn't need to be complete, just present, importing from `base` with `DEBUG = False` and a comment noting it's for future deployment.

Create the three apps as Django apps inside `apps/api/`: `core`, `resumes`, `analysis`. Register all three plus `rest_framework` in `INSTALLED_APPS`.

### 1.2 Dependency Management

Create `requirements/base.txt` and `requirements/dev.txt` as described in §5.3. `base.txt` should include: Django, djangorestframework, django-environ, jsonschema, google-genai, weasyprint, pydantic. `dev.txt` should include everything in `base.txt` plus: ruff, pytest, pytest-django, pytest-mock.

Remember WeasyPrint's system-level dependencies are NOT pip packages (§11.3) — these are documented in the README's setup section, not installed via pip. Don't let a missing system library block initial scaffolding; WeasyPrint can be imported and the dependency installed later when Part 6 (PDF export) is actually being built. If `pip install weasyprint` fails in the current environment due to missing system libs, note it and proceed — it shouldn't block Parts 1-5.

### 1.3 Environment Configuration

Set up `django-environ` in `settings/base.py` per §14.1. Create `.env.example` at `apps/api/` with placeholder values for: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `GEMINI_API_KEY` (leave the example value as a clear placeholder like `your_google_api_key_here`), `DATABASE_URL`. Create an actual `.env` (gitignored) with real local values — `DJANGO_SECRET_KEY` can be any generated string for local dev, `DJANGO_DEBUG=True`, `GEMINI_API_KEY` can be **left empty for now** (this is intentional — it activates "Demo Mode" per §8.7, which is exactly the mode Parts 1-5 should be built and tested against), `DATABASE_URL=sqlite:///db.sqlite3`.

### 1.4 Root `.gitignore`

Create the root `.gitignore` per §14.4 before the first commit: `.env`, `apps/api/.env`, `apps/web/.env.local`, `*.sqlite3`, `__pycache__/`, `*.pyc`, `node_modules/`, `.next/`, plus standard Python/editor artifacts (`.venv/`, `*.egg-info/`, `.DS_Store`).

### 1.5 Ruff Configuration

Create `apps/api/pyproject.toml` with Ruff configuration per §13.1: enable standard Flake8 checks (E, F) and import sorting (I), set a reasonable line length (88 or 100), configure `include`/`extend-include` to cover all `.py` files and `pyproject.toml` itself.

### 1.6 Pre-commit Setup

Create `.pre-commit-config.yaml` at the repo root configuring: a Ruff hook (lint + format) for `apps/api/`, and a Prettier hook for `apps/web/` (the frontend side may already have its own linting from earlier Antigravity work — don't duplicate, just ensure pre-commit covers both halves of the monorepo without conflicting with existing frontend tooling).

**Definition of done for Part 1:** `python manage.py runserver` starts successfully with no app-specific code yet beyond the three empty apps registered. `.env.example`, `.gitignore`, `pyproject.toml`, and `.pre-commit-config.yaml` all exist and are committed (the real `.env` is not).

---

## Part 2 — `core` App

### 2.1 Shared Abstract Models

Implement `TimeStampedModel` as an abstract base model in `core/models.py` with `created_at` (auto-set on creation) and `updated_at` (auto-set on every save) fields, per §7.1 and the example in §12.2. This is the only model `core` needs for now. Keep `core` minimal — it exists to prevent future duplication, not to hold speculative infrastructure.

**Definition of done for Part 2:** `TimeStampedModel` exists, is importable, has no migration issues on its own (it's abstract, so it generates no table directly), and is ready to be inherited by `resumes.Resume`.

---

## Part 3 — `resumes` App (Schema, Model, CRUD)

This is the foundational app — everything else (analysis, frontend types) depends on the schema defined here being exactly right.

### 3.1 The Schema Definition (`resumes/schema.py`)

Encode the locked JSON Resume-derived schema from §6.2 as a Python dictionary representing a JSON Schema document, suitable for use with the `jsonschema` library's `validate()` function. The schema must describe:

- `basics`: an object with `name`, `label`, `email`, `phone`, `url`, `summary` (all strings), `location` (nested object with `city`, `region`, `countryCode`), and `profiles` (array of objects with `network`, `username`, `url`)
- `work`: array of objects with `name`, `position`, `startDate`, `endDate`, `summary` (strings) and `highlights` (array of strings)
- `education`: array of objects with `institution`, `studyType`, `area`, `startDate`, `endDate`, `score` (all strings)
- `projects`: array of objects with `name`, `description`, `url` (strings), `highlights` and `keywords` (arrays of strings)
- `skills`: array of objects with `name` (string) and `keywords` (array of strings) — **no `level` field**, per §6.4
- `certificates`: array of objects with `name`, `date`, `issuer`, `url` (all strings)
- `volunteer`, `awards`, `publications`, `languages`, `interests`, `references`: each simply `array` type with no item schema constraints (these are stubs per §6.3 — they exist for JSON Resume export compatibility but have no UI and no validation requirements beyond "must be an array")

For required vs. optional: per §6.3's tiering, `basics` (with at least `name` present), `work`, `education`, and `skills` should be required top-level keys (though their *contents* — e.g., individual work entries — don't need every field populated; an empty array `[]` is valid for `work` even though it's a "required section" conceptually, since a brand-new resume starts empty). `projects`, `certificates`, and the six stub arrays are also required top-level keys (always present, per §6.3's "always present as empty arrays" rule) but can default to `[]`.

In practice: every one of the top-level keys listed in §6.2 must always be present in a valid document — what's "optional" is whether their *contents* are populated, not whether the keys exist. This is important: it means a brand-new, empty resume is still a fully schema-valid document with all keys present and most arrays/strings empty. Write the schema and a corresponding "empty default" factory function (`get_empty_resume_document()` or similar) that returns this fully-keyed-but-empty structure — this default is used both when creating a new `Resume` model instance and as the frontend's initial Zustand store state (§9.4), so keep this function's output and the TypeScript default in sync conceptually even though they're separate files.

### 3.2 The `Resume` Model (`resumes/models.py`)

Implement the `Resume` model per §12.2: inherits `TimeStampedModel`, has `title` (CharField), `template_id` (CharField, values will be `"classic"`, `"modern"`, or `"minimal"` per the Stitch design spec's template naming — don't hardcode choices restrictively yet, a plain CharField is fine, but document the expected values in a comment), `document_data` (JSONField, defaulting to the output of `get_empty_resume_document()` from §3.1), and `session_key` (CharField, blank-able, indexed) for the lightweight per-browser multi-resume support described in §12.2.

Run and apply the initial migration for this model.

### 3.3 Schema Validation

Implement validation that runs the `jsonschema` validator from §3.1 against `document_data` whenever a `Resume` is created or updated via the API (not necessarily at the raw model `.save()` level, which would also affect Django admin and internal scripts — the validation belongs in the DRF serializer's `validate()` method, per the service-layer/serializer separation). On validation failure, the API should return a `400` with the `jsonschema` validation error details in a readable form (field path + message), not a raw stack trace.

### 3.4 Serializer (`resumes/serializers.py`)

Create a `ModelSerializer` for `Resume` exposing `id`, `title`, `template_id`, `document_data`, `created_at`, `updated_at`. Implement `validate_document_data()` (or an object-level `validate()`) to run the §3.3 schema validation.

### 3.5 ViewSet and Routing (`resumes/views.py`, `resumes/urls.py`)

Implement a standard `ModelViewSet` for `Resume` per §7.3 — `list`, `retrieve`, `create`, `update`, `destroy` all generated automatically via `queryset` + `serializer_class`. For `list` and the session-scoped behavior from §12.2: filter the queryset by `session_key` matching the requesting user's Django session (using `request.session.session_key`, ensuring a session is created if one doesn't exist yet). On `create`, set `session_key` from the current session automatically (don't require the frontend to supply it).

Wire this viewset into `apps/api/config/urls.py` under `/api/resumes/` per the endpoint contract in §7.4.

**Important framing:** per §7.4's note, these CRUD endpoints are **not on the critical path** for the assessment's core milestones (localStorage handles persistence per §12.1). Build them correctly since they're cheap and the schema work is needed regardless, but do not let any difficulty here block progress on Parts 4-6, which *are* on the critical path. If session-scoping proves fiddly, a simpler unscoped version (all resumes visible, no `session_key` filtering) is an acceptable temporary fallback — note it as a known limitation rather than spending excessive time on it.

**Definition of done for Part 3:** `POST /api/resumes/` with a body matching the §3.1 schema (e.g., the output of `get_empty_resume_document()` with `title` and `template_id` added) returns `201` with the created resource. `GET /api/resumes/` returns a list. Submitting a `document_data` that violates the schema (e.g., `skills` as an object instead of an array, or a `work` entry with a `level` field inside `skills`) returns `400` with a useful error message.

---

## Part 4 — `analysis` App, Phase 1: Mocked Service Layer

This phase builds the **entire shape** of the AI-powered endpoints using mock data only — no real Gemini calls yet. The goal is that by the end of Part 4, the frontend can fully integrate against `/api/analysis/critique/` and `/api/analysis/ats-score/` and get realistic, schema-correct, structurally-final responses, while the actual AI integration (Part 5) is built and tested independently afterward.

### 4.1 Pydantic Response Schemas (`analysis/schemas.py`)

Define the Pydantic models exactly as specified in §8.5: `SectionCritique` (with `section`, `score`, `strengths`, `improvements`), `CritiqueResult` (with `overall_score`, `overall_feedback`, `sections`), `KeywordGap` (with `keyword`, `importance`), and `ATSResult` (with `overall_score`, `summary`, `strengths`, `issues`, `has_job_description`, `missing_keywords`).

One addition driven by §6.6 (highlighting): ensure `SectionCritique.section` values are constrained (in documentation/convention, not necessarily a strict enum at this stage) to the top-level resume schema keys that make sense to critique — `"basics"`, `"work"`, `"education"`, `"projects"`, `"skills"`, `"certificates"`. This is what the frontend will match against to know which section of the live preview to highlight. Keep all models flat (one level of list-of-flat-objects max) per §8.5's nesting warning — do not nest `KeywordGap` or `SectionCritique` inside additional wrapper objects beyond what's specified.

### 4.2 Mock Data (`analysis/mock_data.py`)

Write hand-crafted, realistic instances of `CritiqueResult` and `ATSResult` per §8.7. These should not read as placeholder Lorem Ipsum — they should look like genuinely useful sample output, since (per §8.7 and the README strategy in §16) this is what anyone running the project without a Gemini API key will see, and it should feel like a working product.

For `CritiqueResult`: include 2-3 entries in `sections`, covering at least `"work"` and `"skills"` (these are the sections most likely to have actionable feedback), with realistic `strengths` and `improvements` text. Write `improvements` text in the "suggestion" style described in the Stitch spec's Screen 3 — i.e., phrased so it could plausibly be displayed as a proposed rewrite (e.g., "Consider quantifying this: 'Built a recommendation engine that improved cart-to-order ratio by X%'" rather than a generic "add more detail").

For `ATSResult`: write two versions conceptually — one for `has_job_description=False` (covering the 9-point rubric from the updated §8.4) and one for `has_job_description=True` (same plus 2-3 `missing_keywords` entries with varied `importance` values). Both should have realistic `overall_score` values (not 100 — somewhere in the 70-85 range reads as more genuine and gives the "Get feedback" flow somewhere to go).

Write both as functions (`get_mock_critique() -> CritiqueResult`, `get_mock_ats_result(has_job_description: bool) -> ATSResult`) rather than module-level constants, so they're easy to call from both the mock-mode service path and from tests.

### 4.3 Service Layer Stubs (`analysis/services.py`)

Implement three functions with their final signatures, but with mocked bodies for now:

- `generate_critique(resume_data: dict) -> CritiqueResult` — for Part 4, this simply returns `get_mock_critique()`. The signature and return type are final; only the implementation will change in Part 5.
- `compute_ats_score(resume_data: dict, job_description: str | None = None) -> ATSResult` — for Part 4, returns `get_mock_ats_result(has_job_description=job_description is not None)`.
- `render_resume_pdf(resume_data: dict, template_id: str) -> bytes` — for Part 4, this can return a placeholder: either raise `NotImplementedError` with a clear message (if PDF export won't be touched until Part 6 regardless) or return a trivial placeholder PDF byte string if you want the endpoint to be callable end-to-end immediately. Prefer the `NotImplementedError` approach with a TODO comment pointing to Part 6 — this makes it explicit in the codebase what's pending, rather than silently returning fake bytes that might confuse later debugging.

These three functions are the **entire interface** between the views and the "AI/PDF backend." Views never call Gemini, WeasyPrint, or mock data directly — they call these three functions and serialize the result. This is the service-layer pattern from §7.2, and it's what makes Part 5 a drop-in replacement of function *bodies* with zero changes to views, serializers, or URL routing.

### 4.4 Views and Routing (`analysis/views.py`, `analysis/urls.py`)

Implement three `APIView` subclasses per §7.3/§7.4:

- `CritiqueView` — `POST /api/analysis/critique/`, accepts `{ "resume_data": {...} }`, calls `generate_critique(resume_data)`, returns the serialized `CritiqueResult` as JSON with `200`.
- `ATSScoreView` — `POST /api/analysis/ats-score/`, accepts `{ "resume_data": {...}, "job_description": "..." }` (where `job_description` is optional — accept its absence or an empty string as "no JD"), calls `compute_ats_score(resume_data, job_description)`, returns the serialized `ATSResult` as `200`.
- `ExportPDFView` — `POST /api/analysis/export-pdf/`, accepts `{ "resume_data": {...}, "template_id": "..." }`. For Part 4, this view can return a `501 Not Implemented` response with a clear message, since `render_resume_pdf` isn't built yet — this is acceptable and expected at this stage.

Validate the incoming `resume_data` against the §3.1 schema in these views too (reuse the same `jsonschema` validation used in `resumes` — consider extracting it to a shared location, perhaps `resumes/schema.py`'s validation function imported by `analysis`, to avoid duplication). If `resume_data` fails schema validation, return `400` before calling any service function — the AI/PDF layers should never receive malformed resume data.

Wire these into `/api/analysis/` per §7.4.

### 4.5 Service-Layer Tests (Mocked Mode)

Per §13.2 item 1, write tests that call `generate_critique()` and `compute_ats_score()` directly (no HTTP, no DRF client) with sample resume dicts (use `get_empty_resume_document()` and also a "filled-in" sample resume — perhaps based on realistic placeholder content similar to what's in the Stitch preview mockups) and assert the returned objects are valid `CritiqueResult`/`ATSResult` instances with scores in the `0-100` range and non-empty `sections`/`strengths`/`issues` lists as appropriate.

Also write basic API integration tests (§13.2 item 3) using DRF's `APIClient`: `POST /api/analysis/critique/` with a valid resume returns `200` with a body matching the `CritiqueResult` shape; the same with an invalid resume (e.g., missing required top-level keys) returns `400`.

**Definition of done for Part 4:** `/api/analysis/critique/` and `/api/analysis/ats-score/` are fully functional against mock data, return schema-correct JSON, validate input, and have passing tests. `/api/analysis/export-pdf/` exists but returns `501`. The frontend can now be wired up against real, stable endpoint contracts — this is a natural integration checkpoint with frontend work before proceeding to Part 5.

---

## Part 5 — `analysis` App, Phase 2: Real Gemini Integration

This phase replaces the *bodies* of `generate_critique()` and `compute_ats_score()` with real `google-genai` calls, wrapped in the full defensive pipeline from §8.6-§8.8. The function signatures, the views, the serializers, and the URL routing from Part 4 do not change.

**Sequencing note:** this phase can be deferred (as discussed) until after backend scaffolding stabilizes and the frontend has integrated against Part 4's mocked contracts. When it's time to start this phase, the exact Gemini prompt text (system prompts and user-message templates for M3 and M4) will be provided separately — this SKILL section describes the *integration plumbing* around those prompts, which can be built before the final prompt wording is finalized. A placeholder/draft prompt can be used initially and swapped for the final wording without restructuring anything described below.

### 5.1 Gemini Client Setup (`analysis/gemini_client.py`)

Set up the `google-genai` client per §8.2: instantiate `genai.Client()` with `HttpOptions(timeout=30_000)`. Define the `SAFETY_SETTINGS` list using `BLOCK_ONLY_HIGH` for all four harm categories (harassment, hate speech, sexually explicit, dangerous content), exactly as shown in §8.2.

Read `GEMINI_API_KEY` from the environment via `django-environ` (§14.1). **Critically:** check at the top of each service function (or via a shared helper) whether `GEMINI_API_KEY` is empty/unset. If so, immediately return mock data (via the Part 4 mock functions) with a small artificial delay — this is "Demo Mode" per §8.7, and it must remain fully functional. Demo Mode is not a fallback-of-last-resort; it's a first-class, permanently-supported mode of operation for anyone running this project without credentials. Do not let Part 5's real-integration work accidentally break or remove Demo Mode — both paths coexist in the same function via an early branch.

### 5.2 Prompt Construction (`analysis/prompts.py`)

This file holds the system instructions and user-message templates for M3 (critique) and M4 (ATS score). Structure it so that:

- There is one system prompt for critique (establishing the "experienced hiring manager / resume coach" persona per §8.3, with the "critical but constructive" tone instruction)
- There is one system prompt for ATS scoring (establishing the rubric-driven evaluator persona, embedding the 9-point no-JD rubric from the updated §8.4 directly in the prompt text, with conditional instructions for when a JD is present vs. absent)
- Both system prompts reference the §6.2 schema field names directly when describing "the resume" to the model, so the model's understanding of resume structure matches the actual JSON it receives
- User messages are constructed by serializing the relevant parts of `resume_data` (and `job_description` if present) into the prompt — likely as embedded JSON within the text prompt, or passed as structured content depending on what works best with `google-genai`'s content-construction API

Build this file with placeholder/draft prompt text now if the final wording isn't ready — the structure (system prompt + user message template + where `resume_data`/`job_description` get interpolated) is what matters for the plumbing; wording can be refined later as a pure content edit to this file, with no changes needed elsewhere.

### 5.3 Structured Output Configuration

For both `generate_critique()` and `compute_ats_score()`, configure the `generate_content` call with `responseMimeType: "application/json"` and a `responseSchema` derived from the relevant Pydantic model (`CritiqueResult` / `ATSResult`) per §8.5. Per the nesting warning in §8.5 — if the `google-genai` SDK's automatic Pydantic-to-schema conversion produces issues with the one level of nesting these models have (`CritiqueResult.sections: List[SectionCritique]`, `ATSResult.missing_keywords: List[KeywordGap]`), fall back to manually constructing the JSON schema dict (with explicit `propertyOrdering`) rather than relying on automatic conversion. Test this early with a real API call during development — this is the single most likely point of friction per the research findings, so verify it works before building the rest of the pipeline around an assumption.

### 5.4 The Defensive Parsing Pipeline (`analysis/services.py`)

Implement the full pipeline from §8.6 as a shared helper (used by both `generate_critique` and `compute_ats_score`, since the steps are identical regardless of which Pydantic model is being parsed):

1. After receiving the Gemini response, check `response.candidates[0].finish_reason`. If it equals `SAFETY`, do not attempt JSON parsing — raise/return a distinct error condition that the view layer translates to `422` with the message described in §8.6.
2. Strip markdown code fences and any leading/trailing non-JSON text from `response.text` before parsing.
3. `json.loads()` the cleaned string, then validate via the appropriate Pydantic model's `model_validate()`. Catch both `JSONDecodeError` and Pydantic's `ValidationError` — both should be treated identically (see step 5).
4. If validation succeeds, return the validated Pydantic object.
5. If JSON parsing or Pydantic validation fails, this is treated as equivalent to a `429`/rate-limit failure for fallback purposes (§8.7's "JSON parse / Pydantic validation failure" branch) — fall back to mock data. Log the raw response text server-side for debugging (this is valuable during development to see what Gemini actually returned), but the user-facing behavior is a seamless mock fallback, not an error.

### 5.5 The Full Error-Handling Hierarchy

Implement the complete branching logic from §8.7's diagram inside `generate_critique()` and `compute_ats_score()`:

- No API key → mock data + artificial delay (§5.1, "Demo Mode" — always active, not just a fallback)
- `APIError` with code `429` → mock data (extract `e.code`/`e.message` as strings for logging; never attempt to serialize/pickle the raw exception object, per the documented SDK bug referenced in §8.7)
- `APIError` with code `504` or the configured 30s timeout being exceeded → do **not** fall back to mock; instead raise/return a condition the view translates to `503` with a "try again" message
- `APIError` with code `400` → log details server-side, return generic `500` to the view (this branch is expected to be effectively unreachable given India isn't EU/UK-restricted, but the handling should exist defensively)
- `finish_reason == SAFETY` → `422` per §5.4 step 1
- JSON/Pydantic validation failure → mock data per §5.4 step 5
- Success → return validated result

The view layer (`CritiqueView`, `ATSScoreView` from Part 4 — unchanged) needs a small addition here: it must translate whatever signal the service layer uses for the `422`/`503`/`500` branches into the corresponding HTTP responses. Decide on a consistent mechanism for this (e.g., custom exception classes raised by the service layer and caught in the view, or a result-wrapper return type with a status field) — whichever approach is chosen, apply it consistently across both `generate_critique` and `compute_ats_score`, since they share the identical error taxonomy.

### 5.6 Mocked AI Integration Tests

Per §13.2 item 2, this is the highest-signal testing work in the entire backend. Using `pytest-mock`, mock the `google-genai` client's `generate_content` method (or whatever the actual call site ends up being after §5.1-§5.3) to return four canned scenarios, and assert the service layer handles each correctly:

1. A normal successful response (valid JSON matching the Pydantic schema) → service returns the validated object
2. A response with `finish_reason == SAFETY` → service signals the `422` condition
3. A response that raises an `APIError` with code `429` → service falls back to mock data (and the returned object is `== get_mock_critique()` / `get_mock_ats_result(...)`, i.e., genuinely the same mock data path as Demo Mode)
4. A response with malformed/non-schema-conforming JSON (e.g., markdown-wrapped, or missing a required field) → service falls back to mock data

These four tests are effectively a direct test of the §8.7 diagram — they verify the exact protections that keep a live demo from breaking. Treat them as non-negotiable, higher priority than additional prompt-tuning.

**Definition of done for Part 5:** with `GEMINI_API_KEY` unset, behavior is identical to the end of Part 4 (Demo Mode = mock data + delay). With a valid key set, `/api/analysis/critique/` and `/api/analysis/ats-score/` return real Gemini-generated content matching the same response shape. All four §5.6 scenarios pass. Manually triggering a real rate-limit (or simulating one) results in a seamless mock-data response, not an error page.

---

## Part 6 — `analysis` App, Phase 3: PDF Export (M5 Bonus)

This phase implements `render_resume_pdf()`, replacing Part 4's `NotImplementedError` stub, and upgrades `ExportPDFView` from `501` to a working `200` returning `application/pdf` bytes.

### 6.1 System Dependencies

Before writing any rendering code, ensure WeasyPrint's system dependencies are installed in the development environment per §11.3: `libpango-1.0-0`, `libpangoft2-1.0-0`, `libharfbuzz-subset0`, `shared-mime-info` (Debian/Ubuntu package names — adjust for whatever base OS the dev environment uses). Verify `weasyprint` can be imported and `HTML(string="<p>test</p>").write_pdf()` succeeds in isolation *before* integrating it into the Django view — this isolates "is WeasyPrint working at all" from "is my Django integration correct," which is important because WeasyPrint failures from missing system libs manifest as cryptic CFFI errors that are easy to misattribute to application code.

Document the exact `apt-get install` command needed in the README's setup instructions (§11.3, §16.1) as soon as it's confirmed working — this is a known common failure point for anyone else running the project.

### 6.2 PDF HTML Templates (`analysis/pdf/templates/`)

For each of the three templates (`classic`, `modern`, `minimal` — matching `template_id` values and the Stitch design spec's Screens 6-8), create a corresponding Django HTML template that renders `resume_data` (the same §6.2 schema) into the visual layout designed in Stitch, using CSS that strictly follows the ATS-safe rules in §10.2:

- No CSS Grid anywhere
- Flexbox only for single-row alignments (e.g., job title on the left, date range on the right, on one line) — never `flex-direction: row-reverse`, never `order`
- Primary layout vocabulary: `<div>`, `<section>`, `<h1>`-`<h3>`, `<p>`, `<ul>/<li>`, in strict top-to-bottom document order matching the visual reading order
- If any genuine multi-column need exists, use a semantic `<table>` (read in row order) rather than Grid/Flexbox tricks — but per the Stitch specs for Screens 6-8, all three templates were explicitly designed as single-column layouts, so this should not be needed
- No `position: absolute`/`fixed` for content
- No text rendered as images
- Heading hierarchy strictly top-to-bottom: `<h1>` for name, `<h2>` for section titles, `<h3>` for sub-entries if needed

These three HTML templates are the **server-side rendering counterparts** to the frontend's `ClassicTemplate.tsx` / `ModernTemplate.tsx` / `MinimalTemplate.tsx` React components (per §11.2) — they should produce visually equivalent output for the same `resume_data`, but as Django templates with inline or `<style>`-block CSS suitable for WeasyPrint, not as React components. They do not need to be pixel-identical to the React versions, but should be recognizably the same design (same typography choices, same section ordering, same overall structure) per the Stitch outputs for Screens 6-8.

### 6.3 Font Handling

Per §11.4, use widely-available system fonts (standard sans-serif/serif stacks) for these PDF templates, or a single self-hosted web font via `@font-face` if a specific look from the Stitch designs needs to be preserved. Avoid relying on fonts that happen to be present on the development machine but might not be in a deployment environment — verify the chosen fonts render correctly and produce real, selectable text (not font-substitution artifacts) in the output PDF. A quick verification method: open the generated PDF and attempt to select/copy text from it — if the visual text doesn't match the copied text, or if copying produces garbled characters, the font handling needs adjustment.

### 6.4 `render_resume_pdf()` Implementation

Implement the function per §7.6: select the HTML template matching `template_id`, render it with `resume_data` via Django's template engine to produce an HTML string, then call WeasyPrint's `HTML(string=html_string).write_pdf()` to produce the PDF bytes. Per §7.6, this runs **synchronously, inline, in the request thread** — no thread pool, no `asyncio.to_thread`, no special isolation. This is a direct consequence of the sync-WSGI decision (§7.5) and is the *simpler* path, not a compromise — do not add async/threading complexity here.

### 6.5 `ExportPDFView` Completion

Update `ExportPDFView` (from Part 4) to call `render_resume_pdf(resume_data, template_id)` and return the resulting bytes with `Content-Type: application/pdf` and an appropriate `Content-Disposition` header (e.g., `attachment; filename="resume.pdf"`, possibly using the resume's `basics.name` or `title` to construct a nicer filename). Validate `template_id` against the three known values (`classic`/`modern`/`minimal`) and return `400` for unrecognized values, before attempting to render.

### 6.6 Verification

For each of the three templates, generate a PDF from a realistically-filled `resume_data` (not the empty default) and manually verify: (1) the PDF visually resembles the Stitch design for that template, (2) all text is selectable/copyable and matches the visual content (no font-substitution garbling), (3) the document doesn't have obviously broken page-break behavior (content cut off mid-line, sections splitting awkwardly across pages for typical content lengths — a single resume should usually fit on one page, but verify it degrades reasonably if content is long enough to need two).

**Definition of done for Part 6:** `POST /api/analysis/export-pdf/` with valid `resume_data` and any of the three `template_id` values returns a `200` with `application/pdf` content that opens correctly, displays the resume content matching the corresponding template's design, and contains real selectable text.

---

## Part 7 — Final Integration Pass

Once Parts 1-6 are complete:

- Re-run the full test suite (Parts 3, 4, 5) — all should still pass with real Gemini integration active (assuming `GEMINI_API_KEY` is set in the test environment, or that tests appropriately mock the client per §5.6 regardless of whether a real key is present).
- Verify the three endpoints' behavior end-to-end from the frontend: Editing → Analyze resume (ATS score) → Get feedback (critique) → Edit, and the ATS Checker's equivalent flow (§9.7), all hitting real (or Demo Mode) backend responses.
- Verify Demo Mode (`GEMINI_API_KEY` unset) produces a fully coherent experience — this is the mode anyone evaluating the public repo without their own credentials will see, and per §16.1's README strategy, it should be presented as a deliberate feature, not an apology.
- Confirm `.env.example` is accurate and complete, `.gitignore` has prevented any secrets from being committed (double-check git history if `.env` was ever accidentally staged before `.gitignore` was added), and the README's setup instructions (including the WeasyPrint system dependency step from §6.1) are suf ficient for a fresh clone to run successfully.

At this point, the backend is feature-complete for M1 (via `resumes` CRUD, though localStorage is the primary path), M3 (critique), M4 (ATS score, both modes), and M5 bonus (PDF export). M2 (templates) and the remaining M5 base (localStorage) are primarily frontend concerns and are tracked separately.
