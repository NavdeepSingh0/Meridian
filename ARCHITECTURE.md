# Architecture Decision Document
## AI-Powered Resume Builder — Redshot Labs Technical Assessment

**Status:** Living document — v1.0
**Author:** Navdeep (with planning support from Claude)
**Purpose:** Single source of truth for all architectural decisions. Every Stitch design prompt, SKILL.md file, and line of code written by Antigravity should trace back to a decision documented here. If a decision needs to change mid-build, this document is updated first, and the reason for the change is logged in §17 (Decision Log).

---

## Table of Contents

1. [Project Context](#1-project-context)
2. [Guiding Principles](#2-guiding-principles)
3. [Tech Stack Summary](#3-tech-stack-summary)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Repository Structure](#5-repository-structure)
6. [Data Schema — JSON Resume (Locked)](#6-data-schema--json-resume-locked)
7. [Backend Architecture — Django + DRF](#7-backend-architecture--django--drf)
8. [AI Integration Architecture — Gemini](#8-ai-integration-architecture--gemini)
9. [Frontend Architecture — Next.js](#9-frontend-architecture--nextjs)
10. [Template System (M2)](#10-template-system-m2)
11. [PDF Export Architecture (M5 Bonus)](#11-pdf-export-architecture-m5-bonus)
12. [Persistence & Auth Strategy (M5)](#12-persistence--auth-strategy-m5)
13. [Code Quality & Testing](#13-code-quality--testing)
14. [Environment Variables & Secrets Management](#14-environment-variables--secrets-management)
15. [Deployment Notes (Future)](#15-deployment-notes-future)
16. [README Strategy & Trade-offs to Document](#16-readme-strategy--trade-offs-to-document)
17. [Decision Log](#17-decision-log)
18. [Milestone Execution Plan](#18-milestone-execution-plan)
19. [Open Items for Companion Documents](#19-open-items-for-companion-documents)
20. [Appendix — Reference Links](#20-appendix--reference-links)

---

## 1. Project Context

### 1.1 The Assessment

Redshot Labs (Full Stack Developer role, sourced via Wellfound) has issued a 5-day technical assessment: build an **AI-powered Resume Builder** web application. The stack is mandated as **Next.js (frontend) + Python/Django (backend)**, with AI integration via any LLM provider.

### 1.2 Scoring Rubric (from TASK.md)

| Milestone | Base Pts | Bonus Pts | Description |
|---|---|---|---|
| M1 — Resume Editor | 20 | — | Create/edit resume: Name, Summary, Experience, Education, Skills |
| M2 — Template Switcher | 20 | +5 | 2+ visual templates. Bonus: 3+ with live preview |
| M3 — AI Critique | 25 | +10 | LLM feedback on resume content. Bonus: section-by-section critique |
| M4 — ATS Score | 20 | +10 | ATS compatibility score + reasons. Bonus: keyword gap analysis vs JD |
| M5 — Export / Save | 15 | +15 | Save state (localStorage/DB). Bonus: PDF export |

**Pass threshold:** 60/100. **Max base:** 100. **Max with bonus:** 140.

Evaluators explicitly weigh: code quality & structure, problem-solving approach, AI integration thoughtfulness, README clarity, and milestones completed. They explicitly **ignore**: pixel-perfect UI, 100% completion, which LLM was used, framework versions, and whether AI tools were used to write the code.

### 1.3 Real-World Constraints

- 5-day window is real and starts from the date the assessment was received.
- Submission is a **public GitHub repo** + README + optional Loom walkthrough.
- The applicant (Navdeep) is a 2nd-year CS undergrad seeking remote internships — this submission doubles as a **portfolio piece** and will likely be deployed publicly after submission.
- All implementation will be done via **Antigravity IDE**. This document, the Stitch design specs, and the SKILL.md files are the complete brief Antigravity will execute against.

---

## 2. Guiding Principles

These principles resolve ambiguity whenever a new decision needs to be made during implementation that isn't explicitly covered below.

1. **Quality over quantity, exactly as the brief states.** A milestone done cleanly with clear code and a documented rationale beats a milestone done sloppily. If a bonus feature threatens the stability of a base feature, the base feature wins.

2. **Boring and reliable beats clever and fragile.** Every "impressive" architectural choice (async/SSE, dual-model AI routing, Ollama fallback, deep relational schemas) was evaluated and explicitly rejected in favor of simpler alternatives — documented as deliberate trade-offs, not omissions. A reviewer who sees *"I considered X, chose Y because of Z, here's how I'd migrate to X later"* reads as more senior than a reviewer who sees a half-broken X.

3. **One schema to rule them all.** The JSON Resume-derived schema (§6) is the contract between the editor, the Zustand store, localStorage, the Django model, the Gemini prompts, and the PDF templates. Nothing should invent a parallel shape.

4. **Defensive AI integration by default.** Every Gemini call assumes it might fail, time out, get rate-limited, or get safety-blocked — and has a deterministic fallback. The demo must never show a broken AI panel.

5. **Every section of this document should be README-able.** Where a decision involves a trade-off, it's phrased so it can be lifted near-verbatim into the README's "Architectural Decisions and Trade-offs" section later.

---

## 3. Tech Stack Summary

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | Next.js (App Router) | Mandated by brief |
| Frontend language | TypeScript | Type safety for the resume schema |
| Editor/client state | Zustand | Atomic slices, no re-render storms on keystroke |
| Server state | TanStack React Query | Caching/loading/error states for API calls |
| Styling | Tailwind CSS (via Stitch output) | To be confirmed once Stitch designs are generated |
| Backend framework | Django 5 + DRF | Mandated by brief |
| Backend language | Python 3.11+ | |
| Execution model | **Sync WSGI** (not ASGI/async) | Deliberate trade-off — see §7.5 and §16 |
| AI provider | Google Gemini — `gemini-3.5-flash` | Single model for both M3 and M4 — see §8 |
| AI SDK | `google-genai` (unified SDK) | Legacy `google-generativeai` is EOL (Nov 30, 2025) |
| PDF generation | WeasyPrint | HTML/CSS → real-text PDF, ATS-parseable |
| Data validation | `jsonschema` (Python) + TypeScript types (frontend) | Both validate against the same schema (§6) |
| Primary persistence (v1) | `localStorage` | No auth required by brief |
| Secondary persistence (stretch) | SQLite (dev) → `Resume.document_data` JSONField | Session-scoped, no full auth |
| Linting/formatting (Python) | Ruff | Replaces Black + isort + Flake8 |
| Linting/formatting (JS/TS) | ESLint + Prettier | Standard Next.js defaults |
| Git hygiene | `pre-commit` | Runs Ruff + Prettier on every commit |
| Testing (backend) | `pytest` + `pytest-django` | Service-layer unit tests + mocked AI integration tests |
| Repo structure | Monorepo (two top-level app folders) | Turborepo tooling optional — see §5.2 |

---

## 4. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER                                  │
│                                                                   │
│   ┌───────────────────────┐      ┌──────────────────────────┐  │
│   │   Resume Editor (UI)   │◄────►│     Zustand Store          │  │
│   │  (Name/Summary/Work/   │      │  (single source of truth   │  │
│   │   Edu/Skills/Projects) │      │   for resume JSON object)   │  │
│   └───────────────────────┘      └──────────┬─────────────────┘  │
│                                              │ debounced sync       │
│                                              ▼                      │
│                                    ┌──────────────────┐            │
│                                    │   localStorage     │            │
│                                    │  (auto-save, v1)   │            │
│                                    └──────────────────┘            │
│                                                                     │
│   ┌───────────────────────┐      ┌──────────────────────────┐    │
│   │  Template Switcher     │      │  AI Critique / ATS Panel   │    │
│   │  (renders resume JSON  │      │  (React Query mutations →   │    │
│   │   into chosen template)│      │   loading skeleton → result)│    │
│   └───────────────────────┘      └──────────┬─────────────────┘    │
└──────────────────────────────────────────────┼──────────────────────┘
                                                │ HTTPS (JSON)
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DJANGO BACKEND (sync WSGI)                    │
│                                                                     │
│   ┌─────────────┐   ┌──────────────────┐   ┌────────────────────┐ │
│   │  resumes app │   │   analysis app    │   │     core app        │ │
│   │  (CRUD,      │   │  (AI critique,    │   │  (shared base       │ │
│   │  ModelViewSet│   │   ATS score,      │   │   models, mixins)    │ │
│   │  + JSON      │   │   PDF export)     │   │                      │ │
│   │  Schema      │   │  APIView + service│   │                      │ │
│   │  validation) │   │  layer            │   │                      │ │
│   └──────┬───────┘   └─────────┬─────────┘   └─────────────────────┘ │
│          │                     │                                     │
│          ▼                     ▼                                     │
│   ┌─────────────┐      ┌──────────────────┐                          │
│   │  SQLite DB   │      │  google-genai SDK │                          │
│   │  (stretch:   │      │  (sync client)     │──────► Gemini 3.5 Flash │
│   │  Resume model)│      └──────────────────┘        (gemini-3.5-flash)│
│   └─────────────┘               │                                     │
│                                  ▼ (on 429 / no API key)              │
│                          ┌──────────────────┐                          │
│                          │  Mocked JSON       │                          │
│                          │  fallback data     │                          │
│                          └──────────────────┘                          │
│                                                                          │
│   ┌──────────────────────────────────────────────────────┐            │
│   │  WeasyPrint (sync, runs inline in request thread)       │            │
│   │  HTML+CSS (template render) → PDF bytes                  │            │
│   └──────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Key flow notes:**

- The resume JSON object (§6 schema) is created and mutated entirely client-side in Zustand. It is the payload sent to every backend endpoint — the backend never needs to "build up" a resume from fragments.
- `localStorage` is the v1 persistence layer. The Django `Resume` model (§12) is additive and optional — the app is fully functional without it.
- All AI and PDF endpoints are synchronous DRF views. The frontend shows a loading skeleton for the duration (typically <5s for Gemini Flash, near-instant for mocked fallback).
- The Gemini client lives **only** in the Django backend. The frontend never holds or transmits the API key (§14.3).

---

## 5. Repository Structure

### 5.1 Top-Level Layout

```
resume-builder/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # Django backend
├── docs/                        # This document + companion docs
│   ├── ARCHITECTURE.md
│   ├── STITCH_DESIGN_SPEC.md   (planned)
│   ├── BACKEND_RESEARCH.md      (already produced)
│   └── skills/                  # SKILL.md files for Antigravity
├── .gitignore
├── .pre-commit-config.yaml
└── README.md
```

### 5.2 Monorepo Tooling — Turborepo: Optional, Not Required

The backend research suggested Turborepo for monorepo task orchestration. **Decision: skip dedicated Turborepo tooling.** Turborepo's main value (build caching, task pipelines) is JS/TS-specific and doesn't meaningfully extend to a Python/Django app. A plain two-folder monorepo in a single Git repo already delivers the actual benefit the research cared about — atomic commits across frontend and backend changes. If `apps/web` later grows multiple JS packages, Turborepo can be introduced then at near-zero cost. Not worth the setup time now.

### 5.3 Backend Structure (`apps/api/`)

```
apps/api/
├── manage.py
├── config/                      # Project settings (renamed from default project name)
│   ├── __init__.py
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py              # placeholder for future deploy
│   ├── urls.py
│   └── wsgi.py
├── core/
│   ├── models.py                 # TimeStampedModel abstract base
│   └── ...
├── resumes/
│   ├── models.py                  # Resume model (JSONField)
│   ├── schema.py                   # JSON Resume schema (jsonschema dict)
│   ├── serializers.py
│   ├── views.py                    # ModelViewSet
│   ├── services.py
│   ├── selectors.py
│   ├── urls.py
│   └── tests/
├── analysis/
│   ├── views.py                    # APIViews: critique, ats-score, export-pdf
│   ├── services.py                  # orchestration: build prompt → call Gemini → validate
│   ├── gemini_client.py             # SDK client init, config, error handling
│   ├── prompts.py                    # prompt templates for M3/M4
│   ├── schemas.py                     # Pydantic models for structured output
│   ├── mock_data.py                   # fallback JSON for critique + ATS
│   ├── pdf/
│   │   ├── templates/                  # HTML templates for WeasyPrint (mirrors frontend templates)
│   │   └── render.py
│   ├── urls.py
│   └── tests/
├── requirements/
│   ├── base.txt
│   └── dev.txt
├── .env.example
└── pyproject.toml                 # Ruff config lives here
```

### 5.4 Frontend Structure (`apps/web/`)

```
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # landing / redirect to editor
│   ├── editor/
│   │   └── page.tsx                 # main editor view (sections + live preview)
│   └── globals.css
├── components/
│   ├── editor/                       # section forms: BasicsForm, WorkForm, EducationForm, etc.
│   ├── templates/                     # template renderers: ClassicTemplate, ModernTemplate, etc.
│   ├── ai/                             # AICritiquePanel, ATSScorePanel
│   ├── template-switcher/
│   └── ui/                             # shared primitives (buttons, inputs, cards)
├── lib/
│   ├── api/                             # typed API client functions (axios/fetch wrappers)
│   ├── store/                            # Zustand stores (resumeStore.ts)
│   ├── types/                             # TypeScript types mirroring resumes/schema.py
│   ├── hooks/                              # React Query hooks (useCritique, useAtsScore, useResume)
│   └── persistence/                         # localStorage read/write helpers
├── public/
├── .env.local.example
├── eslint.config.mjs
└── package.json
```

---

## 6. Data Schema — JSON Resume (Locked)

### 6.1 Rationale

Rather than design a bespoke schema, the app adopts a **trimmed, extended subset of the open [JSON Resume](https://jsonresume.org/schema) standard**. This was chosen because:

- It collapses what would otherwise be 6-8 relational Django models into a single validated `JSONField`.
- It gives the frontend access to a mature, community-defined TypeScript shape — no bespoke type design needed.
- It keeps the door open for real-world interoperability (importing/exporting actual JSON Resume files) without extra work.
- A single JSON Schema validator on the backend replaces dozens of nested DRF serializers.

### 6.2 The Locked Schema

```json
{
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
      "countryCode": ""
    },
    "profiles": [
      { "network": "", "username": "", "url": "" }
    ]
  },
  "work": [
    {
      "name": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "summary": "",
      "highlights": [""]
    }
  ],
  "education": [
    {
      "institution": "",
      "studyType": "",
      "area": "",
      "startDate": "",
      "endDate": "",
      "score": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "highlights": [""],
      "keywords": [""],
      "url": ""
    }
  ],
  "skills": [
    {
      "name": "",
      "keywords": [""]
    }
  ],
  "certificates": [
    {
      "name": "",
      "date": "",
      "issuer": "",
      "url": ""
    }
  ],
  "volunteer": [],
  "awards": [],
  "publications": [],
  "languages": [],
  "interests": [],
  "references": []
}
```

### 6.3 Section Tiers — Drives Editor UX and Stitch Design

| Tier | Sections | UI Treatment |
|---|---|---|
| **Required** | `basics` (name, summary, label), `work`, `education`, `skills` | Always visible. These are M1's explicit requirement (Name, Summary, Experience, Education, Skills). Prompted first in the editor flow. |
| **Recommended / Add-on** | `projects`, `certificates`, `basics.profiles` | Visible but presented as "Add if relevant" — collapsible sections, encouraged via empty-state hints (e.g., "Add a project to strengthen your resume"). |
| **Hidden / Stub** | `volunteer`, `awards`, `publications`, `languages`, `interests`, `references` | No UI in v1. Always present as empty arrays in the data object purely for **JSON Resume export compatibility** — if a user later exports/imports a real JSON Resume file, these fields round-trip without data loss. |

### 6.4 Key Modifications from Vanilla JSON Resume

| Field | Decision | Reason |
|---|---|---|
| `basics.label` | **Included** | Job title/headline (e.g., "Full Stack Developer") — high value, near-zero cost |
| `basics.profiles` | **Included** | LinkedIn/GitHub links — standard on modern resumes |
| `projects` | **Included as 6th section** | Not in vanilla JSON Resume's "core 5", but realistic for CS/dev resumes and adds genuine utility |
| `skills[].level` | **Excluded** | Skills are a flat `{ name, keywords[] }` — keyword-chip UI, more ATS-conventional than skill-level meters |
| `certificates` | **Included** | Explicitly requested |
| `volunteer`, `awards`, `publications`, `languages`, `interests`, `references` | **Stubbed as empty arrays, no UI** | Full JSON Resume compatibility at zero UI cost |

### 6.5 Validation Strategy

- **Backend:** the schema above is encoded as a Python dict in `resumes/schema.py` and validated via the `jsonschema` library inside the `Resume` model's `clean()` / serializer `validate()` step before any write.
- **Frontend:** a hand-written TypeScript interface (`lib/types/resume.ts`) mirrors this schema exactly. Since the schema is small and stable, generating types via a JSON-Schema-to-TS tool is unnecessary overhead — a manual interface is faster to write and easier for Antigravity to keep in sync.
- **AI prompts:** the same field names are referenced directly in Gemini prompts (§8.3, §8.4) so the model's understanding of "what a resume contains" matches the actual data shape exactly.

---

## 7. Backend Architecture — Django + DRF

### 7.1 App Structure: `core`, `resumes`, `analysis`

| App | Responsibility | Justification |
|---|---|---|
| `core` | Shared abstract models (`TimeStampedModel`), shared mixins, any project-wide utilities | Centralizes infrastructure code, keeps DRY |
| `resumes` | CRUD for `Resume` model, JSON Schema validation, standard `ModelViewSet` | Encapsulates all synchronous, database-heavy operations |
| `analysis` | AI Critique (M3), ATS Score (M4), PDF Export (M5 bonus) | These are RPC-style procedural operations, not CRUD — isolated so their (eventual) heavier infra needs don't entangle the simple `resumes` app |

A three-app split is deliberately minimal. No `users`, `templates`, or `accounts` apps in v1 — there's no auth (§12.3), and templates are a frontend rendering concern with no backend model needed (§10).

### 7.2 Service Layer Pattern

To avoid "fat views" and "fat models," business logic lives in dedicated modules per app:

- **`services.py`** — functions that perform writes, orchestrate external calls, or contain non-trivial logic. Examples: `generate_critique(resume_data: dict) -> CritiqueResult`, `compute_ats_score(resume_data: dict, job_description: str | None) -> ATSResult`, `render_resume_pdf(resume_data: dict, template_id: str) -> bytes`.
- **`selectors.py`** — functions dedicated to complex read queries (mainly relevant to `resumes` if/when the DB stretch goal is implemented).

**Why this matters for a 5-day sprint specifically:** every AI prompt and every PDF-rendering function becomes independently unit-testable by calling the service function directly with a plain dict — no need to spin up `APIClient`, mock `request` objects, or hit real HTTP. This is the single highest-leverage testing decision in this document (see §13.2).

The view's job is reduced to: deserialize request → call service → serialize response. Nothing else.

### 7.3 ViewSets vs. APIViews — Routing Strategy

| Endpoint group | DRF Construct | Reasoning |
|---|---|---|
| `resumes` CRUD | `ModelViewSet` + `ModelSerializer` | Standard CRUD maps cleanly; `list`/`retrieve`/`create`/`update`/`destroy` generated automatically |
| `analysis` (critique, ATS, PDF) | `APIView` subclasses (one per action) | These are procedural RPC actions, not resource CRUD. Forcing them into `@action` on a ModelViewSet produces awkward routing. Plain `APIView` with explicit `post()` methods is clearer. |

### 7.4 API Endpoint Contract (v1)

| Method | Path | App | Purpose |
|---|---|---|---|
| `GET` | `/api/resumes/` | resumes | List saved resumes (stretch — only meaningful once DB persistence exists) |
| `POST` | `/api/resumes/` | resumes | Create/save a resume |
| `GET` | `/api/resumes/{id}/` | resumes | Retrieve a resume |
| `PUT/PATCH` | `/api/resumes/{id}/` | resumes | Update a resume |
| `DELETE` | `/api/resumes/{id}/` | resumes | Delete a resume |
| `POST` | `/api/analysis/critique/` | analysis | M3 — body: `{ resume_data }` → returns `CritiqueResult` |
| `POST` | `/api/analysis/ats-score/` | analysis | M4 — body: `{ resume_data, job_description?: string }` → returns `ATSResult` |
| `POST` | `/api/analysis/export-pdf/` | analysis | M5 bonus — body: `{ resume_data, template_id }` → returns `application/pdf` |

**Note on the `resumes` CRUD endpoints:** these are *not* on the critical path for v1 (localStorage handles persistence). They exist as the foundation for the DB-persistence stretch goal (§12) and are cheap to scaffold early since the `Resume` model and schema validation are needed for that path regardless. If time runs short, these endpoints can simply remain unused by the frontend without any negative impact on M1-M5 base scoring.

### 7.5 Sync-First: The Central Architectural Trade-off

**Decision: standard synchronous Django views (WSGI), not ASGI/async, not `adrf`, not SSE streaming.**

This is the single most consequential deviation from the "textbook ideal" architecture, so it's documented in depth here (and should be lifted into the README's trade-offs section near-verbatim).

**What the textbook-ideal approach would be:** ASGI server (Granian/Uvicorn), `adrf` for `AsyncAPIView`, `google-genai`'s `client.aio` async namespace, `StreamingHttpResponse` with an async generator emitting Server-Sent Events, and a Next.js frontend consuming the SSE stream via the Web Streams API for a typewriter-effect critique.

**Why this was rejected for v1:**

1. **New infrastructure on every layer simultaneously.** ASGI server setup, `adrf`'s non-default router requirements, async ORM gotchas (`sync_to_async`, `thread_sensitive`), SSE parsing on the frontend — each is individually manageable, but *all of them at once*, written by an AI coding agent in a 5-day window, is a lot of new surface area where a single misconfiguration (e.g., `runserver` silently not loading ASGI, or a sync ORM call inside an async view raising `SynchronousOnlyOperation`) can stall a full day of debugging.
2. **The latency it solves isn't actually severe.** Gemini 3.5 Flash averages ~4.7s. For a single-user demo (not a multi-tenant production server), a 4.7s synchronous wait with a well-designed loading skeleton is a perfectly acceptable UX — it is not "broken," just "not instant."
3. **It's invisible to the evaluator if done well, and catastrophic if done poorly.** A working sync app with a polished loading state demonstrates the same "AI integration thoughtfulness" the rubric asks for. A half-broken SSE implementation demonstrates the opposite.

**What this buys us:** standard `requests`-based or sync `google-genai` client calls, normal Django ORM, normal DRF `APIView.post()`, normal `fetch()` + `isLoading` on the frontend. Zero exotic failure modes.

**Migration path (documented for the README):** if streaming were added later, only the `analysis` app's views and the corresponding frontend hooks would change — the service layer functions (`generate_critique`, `compute_ats_score`) already return fully-formed Pydantic objects, so converting them to yield incremental chunks is an additive change, not a rewrite. This isolation is itself a benefit of the service layer pattern (§7.2).

### 7.6 WeasyPrint Under Sync Views — Simplified

The original backend research flagged WeasyPrint's CPU-bound rendering as something requiring thread-pool isolation (`asyncio.to_thread` / `sync_to_async(thread_sensitive=False)`) to avoid blocking an ASGI event loop. **Because v1 is sync WSGI, this concern doesn't apply** — a sync view running CPU-bound work simply occupies its worker thread for the duration, which is exactly how Django/WSGI has worked for two decades. WeasyPrint's `HTML(string=html).write_pdf()` is called directly and synchronously inside the `export-pdf` view's service function. No thread pool, no special isolation. This is another concrete simplification that falls out of the sync-first decision (§7.5).

---

## 8. AI Integration Architecture — Gemini

This section consolidates the findings from the dedicated Gemini research (see `docs/BACKEND_RESEARCH.md` or the original research doc) into concrete implementation rules.

### 8.1 Model & SDK

- **Model:** `gemini-3.5-flash` for **both** M3 (AI Critique) and M4 (ATS Score). A single model avoids divergent prompt-tuning, divergent rate-limit tracking, and doubled error-handling paths — and Flash-tier reasoning is sufficient for both nuanced critique and structured extraction.
- **SDK:** `google-genai` (the unified, current SDK). The legacy `google-generativeai` package is end-of-life.
- **Client mode:** **synchronous** client (`client.models.generate_content(...)`), consistent with the sync-first decision (§7.5). The `client.aio` async namespace exists but is not used in v1.
- **Timeout:** explicit `HttpOptions(timeout=30_000)` (30 seconds) on client init — prevents indefinitely hanging requests from a stalled Gemini backend.

### 8.2 Client Configuration

```python
from google import genai
from google.genai.types import GenerateContentConfig, HttpOptions, SafetySetting, HarmCategory, HarmBlockThreshold

client = genai.Client(http_options=HttpOptions(timeout=30_000))

SAFETY_SETTINGS = [
    SafetySetting(category=cat, threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH)
    for cat in [
        HarmCategory.HARM_CATEGORY_HARASSMENT,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    ]
]
```

**Why `BLOCK_ONLY_HIGH` and not `BLOCK_NONE`:** `BLOCK_NONE` is frequently treated as a restricted field on Free Tier accounts and can trigger an HTTP 400 permission error or a silent backend override that returns a generic refusal. `BLOCK_ONLY_HIGH` satisfies Free Tier permission checks while still raising the threshold enough that legitimate resume content (e.g., "Military combat triage experience," "Mental health crisis counselor") passes through.

### 8.3 M3 — AI Critique: Prompt Design Philosophy

**Goal:** nuanced, constructive, section-aware feedback — base requirement is overall feedback; bonus is section-by-section.

**Design approach:**

- The prompt receives the **full resume JSON** (§6 schema) plus a system instruction establishing the persona: an experienced hiring manager / resume coach giving honest but encouraging feedback.
- The response schema (Pydantic, §8.5) requests **one level of list-of-flat-objects**: an overall score/summary, plus a list of per-section critiques (`section`, `score`, `strengths[]`, `improvements[]`). This satisfies the bonus (section-by-section) and the base (overall) requirement in a single call.
- Sections with no content (e.g., empty `projects`) are either omitted from the critique array or explicitly noted as "not provided — consider adding" — the prompt instructs the model to only critique sections that have content, plus optionally flag entirely-missing recommended sections.
- Tone instruction is explicit in the system prompt: "critical but constructive, never dismissive" — this both produces better output and reduces the chance of the response itself tripping a harassment/negativity safety filter (per §8.1's safety rationale).

### 8.4 M4 — ATS Score: Prompt Design Philosophy

**Goal:** deterministic score + reasons; base works with or without a job description; bonus adds keyword-gap diffing when a JD is provided.

**Design approach — single endpoint, dual mode, driven by presence of `job_description`:**

- **Without JD (base case):** the prompt instructs the model to evaluate the resume against general ATS best practices — the same category of checks tools like ResumeWorded use (e.g., quantified achievements, action-verb usage, absence of tables/columns/graphics indicators, appropriate section headers, contact info completeness, length/density). *(Navdeep to provide the specific parameter list from ResumeWorded-style tools — this will be appended to the prompt as an explicit rubric once available.)*
- **With JD (bonus case):** the prompt additionally receives the job description text and is instructed to extract key skills/requirements from the JD, diff them against the resume's `skills[].keywords` and `work[].highlights` content, and populate a `missing_keywords` array with `{ keyword, importance }`.
- **One response schema handles both modes** via a `has_job_description: bool` field — `missing_keywords` is simply an empty array when no JD was provided. This avoids maintaining two separate endpoints or two separate schemas.

### 8.5 Structured Output — Pydantic Schemas (Flat)

Per the research findings, **deeply nested Pydantic models (objects-within-objects-within-lists, 2+ levels) risk the SDK misinterpreting them as tool-call definitions**, producing `Unknown tool name` errors. The fix is to keep schemas to **at most one level of list-of-flat-objects** — which is sufficient for both M3 and M4.

```python
from pydantic import BaseModel, Field
from typing import List

# --- M3: AI Critique ---

class SectionCritique(BaseModel):
    section: str = Field(description="Resume section name, e.g. 'summary', 'work', 'skills'")
    score: int = Field(ge=0, le=100, description="Section quality score, 0-100")
    strengths: List[str] = Field(description="What works well in this section")
    improvements: List[str] = Field(description="Specific, actionable suggestions")

class CritiqueResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    overall_feedback: str = Field(description="2-4 sentence high-level summary")
    sections: List[SectionCritique]


# --- M4: ATS Score ---

class KeywordGap(BaseModel):
    keyword: str = Field(description="Skill or term present in the JD but missing from the resume")
    importance: str = Field(description="One of: High, Medium, Low")

class ATSResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    summary: str = Field(description="2-4 sentence summary of ATS compatibility")
    strengths: List[str]
    issues: List[str] = Field(description="Specific ATS problems found, e.g. 'No quantified achievements in Experience'")
    has_job_description: bool
    missing_keywords: List[KeywordGap] = Field(description="Empty list if has_job_description is false")
```

**Note on `Field(ge=0, le=100)`:** structured output mode guarantees *syntactic* validity (the JSON will parse) but not *semantic* validity (the model could still emit `overall_score: 999`). The `ge`/`le` constraints are enforced by Pydantic on the Python side after parsing — if violated, the value is clamped or the response is treated as a parse failure and routed to the mock fallback (§8.7).

### 8.6 Defensive Parsing Pipeline

Every Gemini response goes through this pipeline before being returned to the frontend:

1. **Check `finish_reason`.** If `finish_reason == SAFETY`, do not attempt to parse — return a `422` with a clear message ("Content flagged by safety filters") rather than crashing on `JSONDecodeError` from an empty response.
2. **Strip markdown wrappers.** Even with `responseMimeType: application/json`, responses can arrive wrapped in ` ```json ... ``` ` fences or prefixed with conversational text ("Here is your JSON:"). A small sanitization function strips leading/trailing fences and any non-JSON prefix before `json.loads()`.
3. **Parse and validate via Pydantic.** `CritiqueResult.model_validate(parsed_json)` / `ATSResult.model_validate(parsed_json)`. A `ValidationError` here (missing keys, out-of-range scores, wrong types) is treated as equivalent to an API failure and routes to the mock fallback.
4. **Return the validated, serialized Pydantic object** to the frontend.

### 8.7 Error Handling Hierarchy & Mocked Fallback

```
Gemini API call
   │
   ├─ No GEMINI_API_KEY configured at all
   │     → "Demo Mode": always return mock data with a small artificial
   │       delay (time.sleep(1-2s)) to simulate real latency. Documented
   │       prominently in README as the no-credentials path.
   │
   ├─ APIError, code == 429 (RESOURCE_EXHAUSTED)
   │     → Rate limit hit. Return mock data. This is the PRIMARY
   │       demo-safety mechanism — extract e.code / e.message as strings,
   │       never pickle the raw exception (known SDK serialization bug).
   │
   ├─ APIError, code == 504 / timeout exceeded (30s)
   │     → Return a graceful 503 to the frontend: "AI analysis is taking
   │       longer than expected — please try again." Frontend shows a
   │       retry button. Does NOT fall back to mock (a timeout is a real
   │       signal, not a quota issue — surfacing it avoids masking bugs).
   │
   ├─ APIError, code == 400
   │     → Log details server-side, return generic 500 to frontend.
   │       (Should not occur in normal operation given India is not
   │       EU/UK-restricted.)
   │
   ├─ finish_reason == SAFETY
   │     → 422 with polite message (§8.6, step 1).
   │
   ├─ JSON parse / Pydantic validation failure
   │     → Treated as a malformed response; falls back to mock data
   │       (same as 429 — the contract with the frontend must never break).
   │
   └─ Success
         → Defensive parsing pipeline (§8.6) → validated result returned.
```

**The mock data itself** (`analysis/mock_data.py`) is a hand-written, realistic, *structurally perfect* instance of `CritiqueResult` and `ATSResult` — written once, used for both the "no API key" demo mode and the "429/parse failure" fallback. It should read as genuinely useful sample feedback, not obviously placeholder text, so that anyone testing the deployed app without their own API key still sees a polished result.

### 8.8 Ollama — Explicitly Not Used for Fallback

Per the research, a local Ollama model was considered as a tertiary fallback tier between "live Gemini" and "mocked data." **Decision: not used in the application's runtime fallback chain.** A 7B local model on a dev laptop (15-30s response time) would degrade the demo experience far more than instantaneous, structurally-perfect mock data. Ollama remains available purely as an optional **development-time** tool (e.g., iterating on prompt phrasing offline without burning Gemini quota) — entirely outside the application's code path, never referenced by `analysis/services.py`.

### 8.9 Prompt Caching — Not Implemented

Explicit context caching (Gemini's Context Caching API) was evaluated and rejected: the Free Tier doesn't charge for input tokens regardless, the total payload (resume + JD + system prompt) is trivially small relative to the 1M-token context window, and implicit caching's 4,096-token activation threshold is unlikely to be reached by our system prompts. The architectural overhead of cache-ID lifecycle management isn't justified at this scale. Deferred to post-MVP if ever relevant.

---

## 9. Frontend Architecture — Next.js

### 9.1 App Router Structure

A single primary route (`/editor`) houses the entire application — section forms, template switcher, and AI panels are all components within this page, coordinated via the Zustand store. This matches the reality that a resume builder is fundamentally a single-page tool, not a multi-route application. `/` can simply redirect to `/editor`, or serve as a minimal landing page.

### 9.2 State Management Split: Zustand vs. React Query

| State category | Tool | Examples |
|---|---|---|
| **Client state** (the resume being edited) | **Zustand** | The entire resume JSON object (§6 schema); selected template ID; UI state like "which section is expanded" |
| **Server state** (data from Django) | **React Query** | `useCritique()` mutation, `useAtsScore()` mutation, `useExportPdf()` mutation, and (stretch) `useResumes()` query for saved resumes |

**Why this split matters:** the resume JSON is mutated on every keystroke. If this lived in React Context, every component subscribed to that context re-renders on every keystroke anywhere in the form — with a multi-section resume editor, this causes visible input lag. Zustand's atomic-slice subscriptions mean a component editing `work[2].highlights` only re-renders when that specific slice changes, not when `basics.summary` changes elsewhere.

React Query is reserved for genuinely asynchronous server interactions (AI calls, future persistence calls) — it is *not* used for the resume data itself, since that data has no "server" source of truth in v1 (localStorage is synchronous and local).

### 9.3 The Zustand Store

A single store (`lib/store/resumeStore.ts`) holds:

- `resumeData: ResumeSchema` — the full object matching §6
- `selectedTemplateId: string`
- Granular setter actions per section (e.g., `updateBasics()`, `addWorkEntry()`, `updateWorkEntry(index, field, value)`, `removeWorkEntry(index)`, etc.) rather than one generic `setState(path, value)` — explicit actions are easier for Antigravity to wire to specific form fields and easier to unit-test.

### 9.4 localStorage Sync

A debounced effect (e.g., 500ms after the last store mutation) serializes `resumeData` + `selectedTemplateId` to `localStorage` under a single key (e.g., `resume-builder:v1`). On initial app load, the store's initial state is hydrated from `localStorage` if present, falling back to an empty-but-valid instance of the §6 schema otherwise (so every field always has a defined, type-correct default — no `undefined` checks scattered through the UI).

### 9.5 AI Panel Loading Pattern (No SSE)

Per §7.5, AI responses arrive as a single JSON payload after ~1-5 seconds (live) or near-instantly (mock). The UX pattern:

1. User clicks "Get AI Critique" (or "Check ATS Score").
2. The relevant React Query mutation fires; the AI panel immediately swaps to a **skeleton loading state** (shaped like the eventual result — e.g., placeholder score circle + placeholder section cards) rather than a generic spinner. This communicates "it's thinking about *this kind* of result" without needing streaming.
3. The rest of the editor remains fully interactive — the mutation is scoped to the AI panel only, never blocks the form.
4. On success, the skeleton is replaced with the real `CritiqueResult` / `ATSResult`, rendered into score displays, strength/improvement lists, and (for M4 with JD) a keyword-gap table.
5. On error (503 timeout case from §8.7), the panel shows an inline error state with a retry button — not a toast/modal that could be missed.

### 9.6 TypeScript Types

`lib/types/resume.ts` hand-mirrors the §6 schema exactly — field names, nesting, and array-vs-object shapes match 1:1 with `resumes/schema.py`. `lib/types/analysis.ts` similarly mirrors the Pydantic models in §8.5 (`CritiqueResult`, `ATSResult`, `SectionCritique`, `KeywordGap`). Keeping these as hand-written, deliberately-synced files (rather than auto-generated) is appropriate given the schema's small, stable size — and avoids adding a codegen step to a 5-day pipeline.

---

## 10. Template System (M2)

### 10.1 Template Strategy

| Template | Source | Notes |
|---|---|---|
| Template 1 — "Classic" | **Original**, designed via Stitch | The primary, ATS-safe, professional template — designed from scratch to be both visually clean and structurally ideal for WeasyPrint export |
| Template 2 | Adapted from an existing open-source resume template | Task explicitly states template originality isn't evaluated — adapt a well-regarded open layout, restyle to fit the app's design system |
| Template 3 (bonus, if time permits) | Adapted from an existing open-source resume template | Unlocks the M2 bonus (+5 pts) when combined with live preview |

All templates, regardless of source, **must conform to the ATS-safe CSS rules in §10.2** — this is a hard constraint applied uniformly, not just to Template 1, since all templates feed into the same WeasyPrint export pipeline (§11).

### 10.2 ATS-Safe CSS Rules (Applies to All Templates)

These rules exist because ATS parsers extract text in **DOM order**, not **visual order**. Any CSS technique that reorders content visually without reordering it in the DOM produces a scrambled extraction.

| Rule | Detail |
|---|---|
| ❌ No CSS Grid | `display: grid` layouts fragment unpredictably across PDF page breaks in WeasyPrint and risk dropped content |
| ⚠️ Flexbox: sparingly, single-row only | Acceptable for e.g. "Job Title ⟷ Date Range" on one line. **Never** use `flex-direction: row-reverse` or `order` |
| ✅ Semantic block elements | `<div>`, `<section>`, `<h1>`-`<h3>`, `<p>`, `<ul>/<li>` as the primary layout vocabulary |
| ✅ `<table>` for genuine multi-column needs | If a two-column layout is truly needed, a semantic `<table>` (read in row order) is safer than Flexbox/Grid tricks |
| ❌ No `position: absolute` / `fixed` for content | Breaks DOM-order extraction entirely |
| ❌ No text rendered as images | All resume content must be real, selectable text |
| ✅ DOM order = visual reading order | The single governing principle — if in doubt, check this |
| ✅ Heading hierarchy in document order | `<h1>` name → `<h2>` section titles → `<h3>` sub-entries, strictly top-to-bottom |

These rules will be passed verbatim into the Stitch design prompts (companion doc) and the `frontend-design` SKILL.md, so they're enforced from the first design iteration rather than retrofitted.

### 10.3 Live Preview Mechanism (M2 Bonus)

Because `resumeData` and `selectedTemplateId` both live in the Zustand store, "live preview" is structurally trivial: each template is a pure presentational component `TemplateX({ data: ResumeSchema })`. The template switcher simply changes which component renders the *same* `resumeData` from the store. No additional state synchronization logic is needed — this is a natural consequence of the §9.3 store design, not a separate feature to build.

---

## 11. PDF Export Architecture (M5 Bonus)

### 11.1 Why WeasyPrint Over `react-pdf`

`react-pdf`/`@react-pdf/renderer`-style solutions either render via canvas (image-based, **not ATS-parseable** — text becomes pixels) or use a constrained proprietary component model that can't directly reuse the Tailwind/HTML templates built for M2. **WeasyPrint renders real HTML+CSS to a PDF with genuine selectable text**, and — critically — can reuse the *same* template markup/styling philosophy as the on-screen templates (subject to the ATS-safe CSS rules in §10.2, which were chosen specifically because they're also WeasyPrint-compatible).

### 11.2 Implementation Shape

- Each frontend template (`components/templates/ClassicTemplate.tsx`, etc.) has a corresponding **server-side HTML template** (`analysis/pdf/templates/classic.html`, a Django template) that renders the same `resumeData` structure into the same visual layout using the same ATS-safe CSS.
- `POST /api/analysis/export-pdf/` receives `{ resume_data, template_id }`, selects the matching HTML template, renders it with Django's template engine, passes the resulting HTML string to `WeasyPrint.HTML(string=html).write_pdf()`, and returns the bytes with `Content-Type: application/pdf`.
- Per §7.6, this runs **synchronously inline** in the view — no thread pool isolation needed under sync WSGI.

### 11.3 System Dependencies

WeasyPrint requires system-level libraries (`libpango-1.0-0`, `libpangoft2-1.0-0`, `libharfbuzz-subset0`, `shared-mime-info`) that are **not** installed via `pip`. These must be documented explicitly in the README's setup instructions (`apt-get install ...` for Debian/Ubuntu) since their absence causes WeasyPrint to fail with CFFI binding errors at import time, not at call time — a setup-time failure that would otherwise confuse a reviewer trying to run the project.

### 11.4 Font Handling

To avoid WeasyPrint silently substituting fonts in a way that produces visually-correct-but-textually-mangled PDFs, the PDF templates should use widely-available, well-supported fonts (system default sans-serif/serif stacks, or a single self-hosted web font via `@font-face` if a specific look is desired) — not rely on whatever fonts happen to be present on the build machine.

---

## 12. Persistence & Auth Strategy (M5)

### 12.1 v1: localStorage-Only

The brief does not require authentication, and explicitly lists "Save resume state (localStorage or DB)" as satisfying the base M5 requirement. **v1 ships with localStorage as the complete, sufficient persistence layer** (§9.4). The app is fully usable, refresh-safe, and demo-ready with zero backend persistence dependency.

### 12.2 Stretch: DB Persistence via `Resume` Model

If time permits after all base milestones and priority bonuses (§18), the `Resume` model becomes active:

```python
from core.models import TimeStampedModel
from django.db import models

class Resume(TimeStampedModel):
    title = models.CharField(max_length=150)
    template_id = models.CharField(max_length=50)
    document_data = models.JSONField(default=dict)  # validated against schema.py
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
```

- `document_data` stores the exact §6 JSON object — no relational decomposition.
- `session_key` (from Django's built-in session framework) provides lightweight **per-browser** resume lists **without implementing user accounts** — avoids the scope creep of full auth while still allowing "your saved resumes."

### 12.3 Auth: Deferred Indefinitely

Full authentication (DRF token/session auth with `User` accounts) is **not pursued** for this assessment. It's not required by the brief, isn't part of the scoring rubric, and the `session_key` approach above (§12.2) covers the only realistic "multi-resume" need without it. If pursued at all, it would be the very last item after everything else — purely portfolio polish, explicitly out of scope for scoring.

---

## 13. Code Quality & Testing

### 13.1 Linting & Formatting

| Tooling | Scope | Config location |
|---|---|---|
| Ruff | Python (`apps/api`) — replaces Black + isort + Flake8 | `apps/api/pyproject.toml` |
| ESLint + Prettier | TypeScript/React (`apps/web`) | `apps/web/eslint.config.mjs`, `.prettierrc` |
| `pre-commit` | Both, via `.pre-commit-config.yaml` at repo root | Runs Ruff (lint + format) and Prettier on staged files before every commit |

### 13.2 Minimum Viable Testing Strategy

Given the 5-day constraint, testing effort is concentrated where it has the highest signal-to-effort ratio, directly enabled by the service layer pattern (§7.2):

1. **Service-layer unit tests (highest priority).** Because `generate_critique()`, `compute_ats_score()`, and `render_resume_pdf()` are plain functions taking dicts and returning Pydantic objects/bytes, they're tested by calling them directly with fixture resume data — no DB, no HTTP, no mocking the request cycle. Fast and high-signal.
2. **Mocked AI integration tests.** The Gemini client is mocked (`unittest.mock.patch` / `pytest-mock`) to return canned responses for: a normal success, a 429, a safety-blocked response (`finish_reason == SAFETY`), and a malformed-JSON response. Each asserts the service layer's defensive pipeline (§8.6-§8.7) handles it correctly — **this directly tests the error-handling hierarchy that protects the live demo**, which is exactly the part of the system most likely to be exercised unpredictably by an evaluator.
3. **API integration tests (lower priority, time-permitting).** `pytest-django` + DRF's `APIClient` hitting the `resumes` CRUD endpoints to confirm serializer validation against the §6 schema rejects malformed payloads correctly.

Live calls to Gemini are **never** part of the automated test suite — only the mocked paths above.

---

## 14. Environment Variables & Secrets Management

### 14.1 Backend (`apps/api/.env`)

Managed via `django-environ`. Required variables:

```
DJANGO_SECRET_KEY=
DJANGO_DEBUG=True
GEMINI_API_KEY=
DATABASE_URL=sqlite:///db.sqlite3
```

`django-environ` casts these to correct types in `settings/base.py` and causes a clear startup error if a required variable is missing — failing loudly at boot rather than silently at request time.

### 14.2 Frontend (`apps/web/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

**No AI-related keys ever appear here** — see §14.3.

### 14.3 Process Isolation Principle (Critical)

**The `GEMINI_API_KEY` exists only inside the Django backend's environment, and is never sent to, embedded in, or accessible from the Next.js frontend.** The frontend calls `POST /api/analysis/critique/` etc. on the Django backend; Django retrieves the key from its own environment and makes the Gemini call server-side. If the key were ever prefixed `NEXT_PUBLIC_*`, it would be bundled into client-side JavaScript — a catastrophic, scrapeable leak. This rule is absolute and has no exceptions.

### 14.4 Repository Hygiene

- `.gitignore` (root) must include: `.env`, `apps/api/.env`, `apps/web/.env.local`, `*.sqlite3`, `__pycache__/`, `node_modules/`, `.next/` — from the **first commit**.
- `.env.example` (backend) and `.env.local.example` (frontend) are committed, populated with placeholder values (e.g., `GEMINI_API_KEY=your_google_api_key_here`), so a reviewer knows exactly what to configure.

---

## 15. Deployment Notes (Future)

Not required for the assessment (Navdeep will demo locally), but noted for the post-submission portfolio deployment:

- **Backend server:** Granian is a strong choice even for a sync app — it natively supports WSGI and radically simplifies the Dockerfile (single binary, no Gunicorn process-manager layer). Can be adopted at deploy time without any application code changes.
- **WeasyPrint in Docker:** the Dockerfile must explicitly `apt-get install` the system dependencies listed in §11.3 — this is the single most common WeasyPrint deployment failure.
- **Frontend:** Vercel (standard Next.js deployment).
- **Backend hosting:** Railway/Render (both support the `apt-get`-then-`pip install` pattern needed for WeasyPrint).

---

## 16. README Strategy & Trade-offs to Document

### 16.1 README Structure

1. **Project Overview** — what it is, mission, link back to the assessment context
2. **Architecture & Tech Stack** — table from §3
3. **Quickstart / Setup** — copy-pasteable commands for both `apps/web` and `apps/api`, including the WeasyPrint system dependency install step
4. **Architectural Decisions & Trade-offs** — §16.2 below, near-verbatim
5. **Mocked vs. Real AI ("Demo Mode")** — explain §8.7's fallback chain plainly; emphasize that the app works fully without a Gemini key
6. **Milestone Completion Checklist** — table mirroring §1.2's scoring rubric with ✅/⚠️/❌ per row, updated as build progresses
7. **Known Issues** — honest, short list

### 16.2 Trade-offs to Document (Pre-Written Bullets for Reuse)

These are written now so they aren't forgotten under sprint pressure — each can be dropped into the README's trade-offs section with minimal editing:

- **Sync Django views instead of async/SSE streaming.** Chosen for reliability within a 5-day solo sprint over a multi-layer async stack (ASGI server, `adrf`, async ORM boundaries, SSE parsing). The service layer is structured so streaming could be added later by modifying only the `analysis` views and corresponding frontend hooks — see §7.5.
- **Single JSONField for resume data instead of a relational schema.** Adopted the JSON Resume open standard (§6) instead of ~6-8 relational tables. Validated via JSON Schema on write. Trades fine-grained relational queries (not needed at this scale) for development velocity and a single shared contract across frontend, backend, AI prompts, and PDF templates.
- **localStorage-first persistence, DB optional.** The brief explicitly permits localStorage as sufficient for M5. DB persistence (§12.2) is additive and was treated as a stretch goal rather than a foundation, since the brief includes no auth requirement.
- **One Gemini model (`gemini-3.5-flash`) for both AI features.** A dual-model setup (e.g., Pro for critique, Flash for scoring) was considered and rejected — it doubles prompt-tuning effort, rate-limit tracking, and error-handling paths for marginal quality gains, while roughly doubling per-request latency for the heavier model.
- **Mocked-data fallback instead of a local LLM (Ollama) fallback.** A local 7B model's 15-30s response time on a dev laptop would degrade the demo experience more than instantaneous, structurally-correct mock data. Ollama remains useful only as an offline dev-time tool, outside the application's runtime path.
- **Two of three resume templates adapted from existing open-source layouts.** The brief explicitly states template originality isn't evaluated; effort was concentrated on one original ATS-optimized template plus a uniform ATS-safe CSS contract (§10.2) applied to all templates, ensuring every template — original or adapted — exports cleanly via WeasyPrint.

---

## 17. Decision Log

| # | Decision | Status | Notes |
|---|---|---|---|
| 1 | `gemini-3.5-flash` for both M3 & M4 | **Locked** | Verified as a real, current model ID |
| 2 | `google-genai` SDK, sync client | **Locked** | Legacy SDK EOL Nov 30, 2025 |
| 3 | Django: `core` / `resumes` / `analysis` app split | **Locked** | |
| 4 | Service layer pattern (`services.py` / `selectors.py`) | **Locked** | |
| 5 | **Sync WSGI**, no ASGI/SSE for v1 | **Locked** | Central trade-off — §7.5, §16.2 |
| 6 | JSON Resume-derived schema (§6) | **Locked** | Includes `label`, `profiles`, `projects`, `certificates`; excludes `skills[].level`; stubs remaining sections |
| 7 | Zustand (client state) + React Query (server state) | **Locked** | |
| 8 | Monorepo, two folders, Turborepo optional/skipped | **Locked** | |
| 9 | WeasyPrint for PDF export | **Locked** | Runs inline, sync — no thread pool needed (consequence of #5) |
| 10 | ATS-safe CSS rules apply to all templates | **Locked** | §10.2 — feeds Stitch specs |
| 11 | 3 templates: 1 original + 2 adapted | **Locked** | 3rd is bonus-conditional on time |
| 12 | localStorage primary, DB persistence stretch-only | **Locked** | No auth pursued |
| 13 | `BLOCK_ONLY_HIGH` safety settings | **Locked** | |
| 14 | 429 → mock fallback; Ollama excluded from runtime | **Locked** | |
| 15 | Prompt caching not implemented | **Locked** | |
| 16 | Ruff + ESLint/Prettier + pre-commit | **Locked** | |
| 17 | M4 ATS rubric (no-JD mode specifics) | **Open** | Pending Navdeep's ResumeWorded-style parameter list — §8.4, §19 |

---

## 18. Milestone Execution Plan

### 18.1 Priority Order

| Priority | Item | Points | Depends On |
|---|---|---|---|
| 1 | M1 — Resume Editor | 20 base | Schema (§6) |
| 2 | M2 — 2 Templates + switcher | 20 base | M1, ATS-safe CSS (§10.2) |
| 3 | M3 — AI Critique (base) | 25 base | M1, Gemini setup (§8) |
| 4 | M4 — ATS Score (base + JD diff built in from the start) | 20 base + 10 bonus | M1, M3 infra |
| 5 | M5 — localStorage save | 15 base | M1 |
| 6 | M3 bonus — section-by-section critique | +10 bonus | Already designed into M3's schema (§8.3, §8.5) — likely delivered alongside item 3 |
| 7 | M2 bonus — 3rd template + live preview | +5 bonus | M2 |
| 8 | M5 bonus — PDF export (WeasyPrint) | +15 bonus | M2 (templates), §11 |
| 9 | DB persistence (`Resume` model) | unscored, portfolio only | All else |

*Note: because §8.5's schema design bakes section-by-section critique and JD-optional keyword-gap analysis into the M3/M4 endpoints from the start, items 6 and "M4 bonus" are largely delivered as part of items 3-4, not as separate later passes.*

### 18.2 Suggested Day-by-Day Breakdown

| Day | Focus |
|---|---|
| **1** | Repo scaffold (monorepo, Django project + 3 apps, Next.js project), schema (§6) implemented on both sides, `Resume` model + JSON Schema validation. **M1 — full editor** (all required + recommended sections, Zustand store, localStorage hydration). |
| **2** | **M2 base** — Template 1 (original, Stitch-designed) + Template 2 (adapted), template switcher. Begin M3 — Gemini client setup (§8.2), error-handling pipeline (§8.6-§8.7), mock data written first. |
| **3** | Finish **M3** (critique endpoint + frontend panel, section-by-section). **M4** — ATS score endpoint (both no-JD and with-JD modes), frontend panel with keyword-gap display. |
| **4** | **M5 base** — confirm localStorage robustness (refresh, multi-section edits). **M2 bonus** — Template 3 + live preview polish. Begin **M5 bonus** — WeasyPrint setup (§11.3 system deps), PDF template for Template 1. |
| **5** | Finish PDF export for all templates. Testing pass (§13.2). README (§16). Loom recording. Buffer for any slippage. |

This breakdown assumes the documentation/research phase (this document + companion docs) is complete *before* Day 1 begins — i.e., these 5 days are pure implementation days via Antigravity.

---

## 19. Open Items for Companion Documents

These are explicitly **not** resolved here and are tracked for the next planning sessions:

1. **M4 no-JD ATS rubric specifics.** Navdeep will provide the exact parameter list from ResumeWorded-style tools (e.g., specific checks for action verbs, quantification, length, formatting red flags). This becomes the explicit rubric embedded in the M4 prompt (§8.4) and should be added to this document's §8.4 once available.
2. **Stitch Design Spec** — per-screen prompts for: the editor layout (section-by-section forms + live preview pane), the template switcher UI, the AI Critique panel (including section-by-section display), the ATS Score panel (including the JD input + keyword-gap table), and the three resume templates themselves (all must satisfy §10.2's ATS-safe CSS rules).
3. **SKILL.md files** — at minimum: `frontend-design` (incorporating §10.2 + Tailwind conventions from Stitch output), `ai-integration` (encoding §8 in full, including the exact prompt text once drafted), `backend-django` (encoding §7), `pdf-export` (encoding §11).
4. **Exact prompt text** for M3 and M4 — §8.3/§8.4 establish the *design philosophy*; the literal system prompts and user-message templates still need to be drafted, tested against real Gemini calls, and iterated.
5. **Tailwind confirmation** — §3 lists Tailwind as "to be confirmed once Stitch designs are generated." If Stitch outputs something else, §3 and §5.4 should be updated accordingly.

---

## 20. Appendix — Reference Links

- JSON Resume Schema: https://jsonresume.org/schema
- `google-genai` SDK docs: https://googleapis.github.io/python-genai/
- Gemini structured output docs: https://ai.google.dev/gemini-api/docs/structured-output
- Gemini safety settings docs: https://ai.google.dev/gemini-api/docs/safety-settings
- WeasyPrint docs: https://doc.courtbouillon.org/weasyprint/stable/
- Ruff configuration: https://docs.astral.sh/ruff/configuration/
- HackSoftware Django Styleguide (service layer pattern): https://github.com/HackSoftware/Django-Styleguide

---

*End of document. This is a living reference — update §17 (Decision Log) whenever a locked decision changes, and update §19 as open items are resolved by companion documents.*

## Additions for ARCHITECTURE.md
Append to §6.3 (Section Tiers) or as a new §6.6 — Highlighting mechanism:

6.6 Highlight Granularity (M3 Feedback)

Critique highlighting in the Feedback state operates at section level, not entry/line level. SectionCritique.section (§8.5) identifies a top-level resume section (e.g., "work", "skills", "summary"). When a section has critique items, the frontend highlights that entire section block in the live preview with a numbered marker; the critique card's text describes the specific entry/line in prose (e.g., "in your Credwork entry, the second bullet lacks a quantified result"). Entry/line-level highlighting (e.g., work[2].highlights[1]) is deferred to post-MVP.

Append to §9.5 (AI Panel Loading Pattern) — JD field placement:

The "Job description (optional)" input lives in the Editing state's right panel, above the "Analyze resume" button — supplied (or left empty) before the first analysis. It is not a separate step; if provided, both M4's keyword-gap analysis and M3's critique use it as additional context for the same single "Analyze resume" action's first call (ATS score). The critique call (M3, triggered separately via "Get feedback") does not require the JD but may reference it if present.

Append as new §9.7 — Editor State Machine (Editing / Scored / Feedback):

9.7 Right-Panel State Machine
StateRight panelLeft sidebarCenter previewEditing (default)Optional JD textarea + "Analyze resume" buttonFully interactiveLive, editableScored (after "Analyze resume")ATS score, summary, strengths/issues, keyword gaps (if JD given), "Get feedback" + "Edit" buttonsLocked (reduced opacity, non-interactive)Read-only, subtle locked indicatorFeedback (after "Get feedback")Section-by-section critique cards with numbered markers, "Edit" buttonLockedRead-only, with numbered highlight overlays on critiqued sections (§6.6)
Clicking Edit from Scored or Feedback returns to Editing: sidebar re-enables, preview unlocks, highlights clear, right panel resets to its default state. Previous score/feedback results are discarded — re-analysis is required after any edit.
ATS Checker is a separate full-width entry point (no left sidebar) that reads existing resume data from localStorage: if none exists, redirect to Editing; if present, show a distinct Loading screen, then a Results view combining Scored + Feedback content side-by-side. "Edit" from Results navigates to the Resume Builder's Editing state.

Append/replace §8.4 — finalized M4 rubric:

8.4 M4 — ATS Score: Finalized Rubric
The no-JD mode evaluates the resume against the following checks, derived from industry-standard ATS checkers (e.g., Resume Worded categories), filtered to what's assessable from resume content alone:

ATS Parse Rate — structural elements that would break parsing (tables, columns, images, icons, unusual characters)
Essential Sections — presence/non-emptiness of Name, Summary, Experience, Education, Skills
Contact Information — email, phone, location present and properly formatted
Quantifying Impact — presence of metrics/numbers in experience/project bullets where plausible
Repetition — repeated words/phrases, especially weak verbs, across bullets
Bullets Consistency — consistent formatting/tense/punctuation across bullet points
Spelling & Grammar — basic textual issues
Readability — sentence length, jargon density, clarity
Sections Order — conventional ordering for the candidate's apparent experience level

With JD provided: add 10. Tailoring / Keyword Gap — extracted JD requirements diffed against resume skills[].keywords and work[]/projects[] content, populating missing_keywords.
Explicitly out of scope (require external data or premium-tier infra not available here): HR Red Flags category (Credibility, Interview Risks, Peer Benchmarking, LinkedIn Match), Seniority matching, File Format/Size/Name checks (handled by our controlled export pipeline, not content analysis). "Discrimination"/bias-in-language and "Growth signals"/"Leadership"/"Drive" tone checks are folded into M3 critique rather than M4 scoring, where qualitative tone feedback belongs.