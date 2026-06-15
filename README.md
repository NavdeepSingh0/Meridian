# Meridian CV — AI-Powered Resume Builder

An end-to-end resume builder with real-time AI critique, ATS (Applicant Tracking System) compatibility scoring, and PDF export functionality. Built for the Redshot Labs technical assessment.

## Overview

Meridian CV allows users to craft professional resumes using a structured block editor, instantly visualize the result across multiple premium templates, and leverage the Gemini 3.5 Flash LLM to analyze their resume for weaknesses and keyword gaps against real job descriptions. 

This project demonstrates a full-stack Next.js and Django architecture, focusing on clean separation of concerns, robust defensive programming around AI integrations, and a deeply polished user experience.

## Milestones Completed

- **[x] M1 — Resume Editor:** Full CRUD for Name, Summary, Experience, Education, Skills, Projects, and Certificates. Built with a highly responsive, atomic-slice Zustand store.
- **[x] M2 — Template Switcher:** 3 unique, ATS-safe visual templates (Classic, Modern, Minimal) with instant live preview.
- **[x] M3 — AI Critique:** Deep integration with Gemini to provide section-by-section actionable feedback and automatic "Apply Suggestion" capabilities.
- **[x] M4 — ATS Score:** Keyword gap analysis that diffs the user's resume against a pasted Job Description, scoring compatibility.
- **[x] M5 — Export / Save:** 
  - **Export:** Robust, backend-generated PDF export (using WeasyPrint with a gracefully falling-back `xhtml2pdf` pipeline).
  - **Save:** Dual-layer persistence — instant debounced `localStorage` autosaving, plus a "Save to Cloud" feature backed by SQLite.

---

## Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **State Management:** Zustand (Client state), TanStack React Query (Server state)
- **Styling:** CSS Modules / CSS Variables

### Backend
- **Framework:** Django 5 + Django REST Framework
- **Language:** Python 3.11+
- **AI SDK:** `google-genai` (synchronous client)
- **Model:** `gemini-3.5-flash`
- **PDF Generation:** WeasyPrint / xhtml2pdf fallback
- **Database:** SQLite (dev)

---

## Architectural Decisions & Trade-offs

### 1. Sync WSGI vs. Async/SSE Streams
The AI endpoints (`/api/analysis/critique/`) use standard synchronous Django views (WSGI) rather than streaming Server-Sent Events (SSE) over ASGI.
- **Trade-off:** The user waits ~3-5 seconds for a complete response rather than seeing a typewriter effect.
- **Rationale:** A full ASGI/SSE implementation introduces immense architectural complexity (async ORM gotchas, uvicorn configurations) that is brittle in a 5-day sprint. A synchronous request with a well-designed frontend "skeleton loading" state provides an excellent UX without the exotic failure modes of streaming. 

### 2. The "JSON Resume" Schema
Rather than designing 6-8 nested relational SQL tables (Users -> Resumes -> Experiences -> Highlights), the app uses a modified version of the open [JSON Resume](https://jsonresume.org/schema) standard, stored in a single Django `JSONField`.
- **Trade-off:** Querying individual resume items via SQL is harder.
- **Rationale:** The entire resume is mutated atomically on the client anyway. A single JSON schema serves as a unified contract between the frontend TS types, the backend Pydantic models, the LLM prompts, and the database.

### 3. Defensive AI Parsing Pipeline
Every response from Gemini passes through a strict Pydantic parsing and validation pipeline.
- **Trade-off:** Deeply nested Pydantic models can confuse the SDK. We kept our schemas to at most one level of list-of-flat-objects.
- **Rationale:** The system must *never* crash from a malformed LLM response. If Gemini hits a safety filter (`finish_reason == SAFETY`), or rate limits (429), or outputs invalid JSON, the backend intercepts the failure and either gracefully falls back to structurally perfect mock data, or safely returns a 503 timeout.

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- Python (3.11+)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements/base.txt

# Run migrations (creates the local SQLite db)
python manage.py migrate

# Add your Gemini API Key
# Open backend/.env and ensure you set:
# GEMINI_API_KEY=your_api_key_here

# Start the server
python manage.py runserver
```

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install

# Start the Next.js dev server
npm run dev
```

Open `http://localhost:3000` to start building!
