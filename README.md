# Meridian CV — AI-Powered Resume Builder

An end-to-end, production-grade resume builder featuring real-time AI critique, ATS (Applicant Tracking System) compatibility scoring, and a robust PDF export pipeline. Built for the **Redshot Labs** technical assessment.

---

## 🚀 Milestones Completed & Rubric Mapping

All core milestones and bonus objectives have been fully completed:

- **M1 — Resume Editor** ✅ *(20 pts)*
  - Full CRUD operations for Name, Summary, Experience, Education, Skills, Projects, and Certificates.
  - Built with a highly responsive, atomic-slice Zustand store with automatic change tracking.
- **M2 — Template Switcher** ✅ *(20 pts + 5 bonus)*
  - 3 unique, ATS-safe visual templates (Classic, Modern, Minimal) designed with curated typography and color systems.
  - Implemented client-side format settings (font size, document padding) that render in real-time.
- **M3 — AI Critique** ✅ *(25 pts + 10 bonus)*
  - Deep integration with Gemini 3.5 Flash for section-by-section, actionable critique.
  - **Beyond Scope (Bonus Highlight):** Implemented one-click "Apply Suggestion" buttons that automatically update the target resume section with the AI's recommended text. This was not in the assessment requirements but was built to showcase a premium UX loop.
- **M4 — ATS Score** ✅ *(20 pts + 10 bonus)*
  - Stands as a dedicated standalone tool and interactive panel in the builder.
  - Diff-checks the user's resume against a pasted Job Description, identifying missing/present keywords, calculating an overall match score, and providing visual highlights on the resume canvas for deficient areas.
- **M5 — Export / Save** ✅ *(15 pts + 15 bonus)*
  - **Export:** Production-ready backend PDF generation pipeline using WeasyPrint with a graceful, native Python fallback to `xhtml2pdf` if system-level GTK binaries are missing.
  - **Save:** Dual-layer persistence — instant debounced `localStorage` autosaving on the client, plus an on-demand "Save to Cloud" option powered by SQLite.

---

## 🎨 Key Features & Premium UX

- **Real-Time Canvas Synchrony:** Swapping templates, adjusting margins, or updating content renders instantly on the resume preview canvas.
- **Dynamic Context Highlighting:** When the ATS scanner identifies missing sections or keyword gaps, those sections are highlighted on the canvas with interactive overlays so you know exactly where to make edits.
- **Defensive AI Engineering:** The backend uses Pydantic schemas to enforce structured JSON outputs from Gemini, wrapping all calls in validation checks. If an LLM output fails, it recovers gracefully to ensure a robust system that never crashes.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **State Management:** Zustand (Client state), TanStack React Query (Server state)
- **Styling:** Vanilla CSS Modules & CSS Variables (for runtime spacing and typography scaling)

### Backend
- **Framework:** Django 5 + Django REST Framework
- **Language:** Python 3.11+
- **AI Integration:** `google-genai` (synchronous client) using `gemini-3.5-flash`
- **PDF Generation:** WeasyPrint / xhtml2pdf fallback
- **Database:** SQLite (development)

---

## 📐 Architectural Decisions & Trade-offs

### 1. Sync WSGI vs. Async/SSE Streams
The AI endpoints (`/api/analysis/critique/`) use standard synchronous Django views (WSGI) rather than streaming Server-Sent Events (SSE) over ASGI.
* **Trade-off:** The user waits ~3-5 seconds for a complete response rather than seeing a typewriter effect.
* **Rationale:** A full ASGI/SSE implementation introduces immense architectural complexity (async ORM gotchas, uvicorn configurations) that is brittle in a short sprint. A synchronous request with a well-designed frontend "skeleton loading" state provides an excellent UX without the exotic failure modes of streaming. 

### 2. Unified Contract: The "JSON Resume" Schema
Rather than designing 6-8 nested relational SQL tables (Users -> Resumes -> Experiences -> Highlights), the app uses a modified version of the open [JSON Resume](https://jsonresume.org/schema) standard, stored in a single Django `JSONField`.
* **Trade-off:** Querying individual resume items via SQL is harder.
* **Rationale:** The entire resume is mutated atomically on the client anyway. A single JSON schema serves as a unified contract between the frontend TS types, the backend Pydantic models, the LLM prompts, and the database.

### 3. Defensive AI Parsing Pipeline
Every response from Gemini passes through a strict Pydantic parsing and validation pipeline.
* **Trade-off:** Deeply nested Pydantic models can confuse the SDK. We kept our schemas to at most one level of list-of-flat-objects.
* **Rationale:** The system must *never* crash from a malformed LLM response. If Gemini hits a safety filter (`finish_reason == SAFETY`), or rate limits (429), or outputs invalid JSON, the backend intercepts the failure and either gracefully falls back to structurally perfect mock data, or safely returns a 503 timeout.

---

## 💻 Setup & Running Locally

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
# Ensure the backend is running on http://localhost:8000
npm run dev
```

Open `http://localhost:3000` to start building!
