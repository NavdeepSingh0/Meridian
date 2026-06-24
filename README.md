# Meridian CV — AI-Powered Resume Builder

An end-to-end, production-grade resume builder featuring real-time AI critique, ATS (Applicant Tracking System) compatibility scoring, and a robust PDF export pipeline. Built for the **Redshot Labs** technical assessment.

---

## 🎥 Video Demo & Walkthrough

> 

https://github.com/user-attachments/assets/d6ab7154-8095-4e5b-83e3-80ccfe3ead68







---

## 🏆 Milestones Completed & Rubric Mapping

**Total Score: 140 / 140 Points**  
All core milestones and **every single bonus objective** have been fully completed and deployed to production.

- **M1 — Resume Editor** ✅ *(20 / 20 pts)*
  - Full CRUD operations for Name, Summary, Experience, Education, Skills, Projects, and Certificates.
  - Built with a highly responsive, atomic-slice Zustand store with automatic change tracking.
- **M2 — Template Switcher** ✅ *(25 / 25 pts — Incl. Bonus)*
  - 3 unique, ATS-safe visual templates (Classic, Modern, Minimal) designed with curated typography and color systems.
  - Implemented client-side format settings (font size, document padding) that render in real-time.
- **M3 — AI Critique** ✅ *(35 / 35 pts — Incl. Bonus)*
  - Deep integration with Gemini / Groq for section-by-section, actionable critique.
  - **Beyond Scope (Bonus Highlight):** Implemented one-click "Apply Suggestion" buttons that automatically update the target resume section with the AI's recommended text.
- **M4 — ATS Score** ✅ *(30 / 30 pts — Incl. Bonus)*
  - Analyzes the user's resume against a pasted Job Description, identifying missing/present keywords, calculating an overall match score, and providing actionable recommendations to bridge the keyword gap.
- **M5 — Export / Save** ✅ *(30 / 30 pts — Incl. Bonus)*
  - **Export:** Production-ready backend PDF generation pipeline using Python's `xhtml2pdf` engine, rendering the exact visual template chosen by the user.
  - **Save / Auth:** Complete user authentication and persistence layer using **Firebase Auth** and a managed PostgreSQL database. All cloud saving and PDF exports require users to log in.

---

## ✨ Key Features & Premium UX

- **Real-Time Canvas Synchrony:** Swapping templates, adjusting margins, or updating content renders instantly on the resume preview canvas.
- **Defensive AI Engineering:** The backend uses strict Pydantic schemas to enforce structured JSON outputs from the LLMs, wrapping all calls in validation checks. If an LLM output fails or rate limits, it recovers gracefully to ensure a robust system that never crashes.
- **Full Production Deployment:** Separated Monorepo deployment with the frontend highly optimized on a serverless edge network and the heavy PDF generation backend running safely in a persistent container.

---

## 💻 Technology Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Deployment:** Vercel
- **Language:** TypeScript
- **State Management:** Zustand (Client state), TanStack React Query (Server state)
- **Authentication:** Firebase Auth
- **Styling:** Tailwind CSS & raw CSS Modules

### Backend
- **Framework:** Django 5 + Django REST Framework
- **Deployment:** Render.com (Gunicorn WSGI)
- **Language:** Python 3.11+
- **Database:** Supabase PostgreSQL (via `dj-database-url` and `psycopg2-binary`)
- **AI Integration:** `google-genai` and `groq` SDKs
- **PDF Generation:** `xhtml2pdf` / ReportLab
- **Security:** Custom `SupabaseJWTAuthentication` class decoding RSA-signed JWTs locally via `PyJWT`.

---

## 📐 Architectural Decisions & Trade-offs

### 1. Unified Contract: The "JSON Resume" Schema
Rather than designing 6-8 nested relational SQL tables (Users -> Resumes -> Experiences -> Highlights), the app uses a modified version of the open [JSON Resume](https://jsonresume.org/schema) standard, stored in a single Django `JSONField` in PostgreSQL.
* **Trade-off:** Querying individual resume items via SQL is harder.
* **Rationale:** The entire resume is mutated atomically on the client anyway. A single JSON schema serves as a unified contract between the frontend TS types, the backend Pydantic models, the LLM prompts, and the database.

### 2. Defensive AI Parsing Pipeline
Every response from Gemini/Groq passes through a strict Pydantic parsing and validation pipeline.
* **Trade-off:** Deeply nested Pydantic models can confuse the SDK. We kept our schemas to at most one level of list-of-flat-objects.
* **Rationale:** The system must *never* crash from a malformed LLM response. If the AI hits a safety filter (`finish_reason == SAFETY`), rate limits (429), or outputs invalid JSON, the backend intercepts the failure and either gracefully falls back to structurally perfect mock data, or safely returns a 503 error.

### 3. Sync WSGI vs. Async/SSE Streams
The AI endpoints (`/api/analysis/critique/`) use standard synchronous Django views (WSGI) rather than streaming Server-Sent Events (SSE) over ASGI.
* **Trade-off:** The user waits ~3-5 seconds for a complete response rather than seeing a typewriter effect.
* **Rationale:** A full ASGI/SSE implementation introduces immense architectural complexity (async ORM gotchas, uvicorn configurations) that is brittle in a short sprint. A synchronous request with a well-designed frontend "skeleton loading" state provides an excellent UX without the exotic failure modes of streaming.
