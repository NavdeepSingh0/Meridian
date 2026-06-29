# Meridian CV — AI-Powered Resume Builder

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green?logo=django)](https://www.djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render)](https://render.com/)

**Meridian CV** is a production-grade, full-stack resume building platform that combines real-time editing, intelligent AI-powered analysis, and professional PDF export capabilities. Built for the **Redshot Labs** technical assessment.

---

## 🎥 Video Demo

Watch the complete walkthrough demonstrating all core features:

https://github.com/user-attachments/assets/d6ab7154-8095-4e5b-83e3-80ccfe3ead68

---

##  Features

###  Real-Time Resume Editor
- **Full CRUD Operations**: Create, edit, and manage all resume sections including Name, Summary, Experience, Education, Skills, Projects, and Certificates
- **Atomic State Management**: Built with Zustand slices for automatic change tracking and instant UI updates
- **Live Preview**: Changes reflect immediately on the resume preview canvas

###  Template System
- **3 Professional Templates**: Classic, Modern, and Minimal designs with curated typography and color systems
- **Customizable Settings**: Adjust font size and document margins in real-time
- **ATS-Safe Formatting**: All templates optimized for Applicant Tracking System parsing

###  AI-Powered Analysis
- **Intelligent Critique**: Section-by-section actionable feedback powered by Groq (Llama 3.3 70B)
- **One-Click Improvements**: Apply AI suggestions directly to your resume with a single click
- **ATS Score Matching**: Upload a job description and get a compatibility score with keyword gap analysis
- **PDF Parsing**: Upload existing PDF resumes and automatically extract content into editable format

###  Export & Persistence
- **Professional PDF Export**: Backend PDF generation using WeasyPrint with xhtml2pdf fallback
- **Cloud Storage**: Save resumes to PostgreSQL database with Firebase Authentication
- **Credit System**: Token-based AI usage tracking with premium tier support

---

##  Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Vercel)                        │
│  Next.js 16 │ TypeScript │ Zustand │ React Query │ Firebase Auth │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Render.com)                        │
│         Django 5 │ DRF │ Python 3.11 │ Gunicorn │ JWT Auth       │
├─────────────────────────────────────────────────────────────────┤
│  Core Apps:                                                      │
│  • analysis    → AI critique, ATS scoring, PDF export/parsing   │
│  • resumes     → Resume CRUD with JSONField storage             │
│  • core        → User profiles, authentication, credits         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
        ┌──────────────┐ ┌──────────┐ ┌──────────────┐
        │   Supabase   │ │  Groq    │ │   Firebase   │
        │  PostgreSQL  │ │   AI     │ │  Credentials │
        └──────────────┘ └──────────┘ └──────────────┘
```

---

##  Technology Stack

### Frontend
| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| State Management | Zustand (client), TanStack React Query (server) |
| Authentication | Firebase Auth |
| Styling | Tailwind CSS 4 + CSS Modules |
| UI Components | Framer Motion, Lucide React |
| Deployment | Vercel (Serverless Edge Network) |

### Backend
| Category | Technology |
|----------|------------|
| Framework | Django 5.0 + Django REST Framework |
| Language | Python 3.11 |
| Database | Supabase PostgreSQL (via `dj-database-url`) |
| AI Integration | Groq SDK (Llama 3.3 70B) |
| PDF Generation | WeasyPrint + xhtml2pdf fallback |
| Authentication | Custom JWT Authentication (Firebase) |
| Server | Gunicorn WSGI |
| Deployment | Render.com (Docker container) |

### Key Dependencies
**Backend (`requirements/base.txt`):**
- Django 5.0.6, djangorestframework 3.15.2
- groq 1.4.0, pydantic 2.9.2
- weasyprint 57.2, xhtml2pdf 0.2.17
- psycopg2-binary, dj-database-url
- firebase-admin 6.5.0, PyJWT, cryptography

**Frontend (`package.json`):**
- next 16.2.9, react 19.2.4
- @tanstack/react-query 5.101.0
- zustand 5.0.14, axios 1.18.0
- firebase 12.15.0, framer-motion 12.40.0

---

##  Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Groq API key (free at https://console.groq.com/)
- Firebase project with credentials
- (Optional) Supabase PostgreSQL database

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/base.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your API keys and settings

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

**Environment Variables (`backend/.env`):**
```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
GROQ_API_KEY=your_groq_api_key_here
FIREBASE_CREDENTIALS={"type": "service_account", "project_id": "..."}
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create local environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## 📡 API Endpoints

### Authentication
All endpoints require Firebase JWT authentication via `Authorization: Bearer <token>` header.

### Resume Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resumes/` | List user's resumes |
| POST | `/api/resumes/` | Create new resume |
| GET | `/api/resumes/<id>/` | Get resume details |
| PUT | `/api/resumes/<id>/` | Update resume |
| DELETE | `/api/resumes/<id>/` | Delete resume |

### AI Analysis
| Method | Endpoint | Description | Credits |
|--------|----------|-------------|---------|
| POST | `/api/analysis/critique/` | Generate AI critique | 1 |
| POST | `/api/analysis/ats-score/` | Calculate ATS match score | 1 |
| POST | `/api/analysis/apply-suggestion/` | Rewrite section with suggestion | 1 |
| POST | `/api/analysis/parse-pdf/` | Extract data from PDF upload | 1 |
| POST | `/api/analysis/export-pdf/` | Generate PDF download | 0 |

**Request/Response Example (Critique):**
```json
// POST /api/analysis/critique/
{
  "resume_data": { /* JSON Resume object */ }
}

// Response 200 OK
{
  "overall_impression": "Strong resume with clear structure...",
  "section_feedback": [
    {
      "section": "experience",
      "feedback": "Quantify achievements with metrics...",
      "suggestion": "Rewrote bullet points to emphasize impact..."
    }
  ]
}
```

---

##  Key Architectural Decisions

### 1. JSON Resume Schema as Single Source of Truth
Instead of 6-8 relational tables, the entire resume is stored in a single PostgreSQL `JSONField`. This provides:
- **Unified Contract**: Same schema used by TypeScript types, Pydantic models, LLM prompts, and database
- **Atomic Mutations**: Entire resume updated in one operation
- **Flexibility**: Easy to add new fields without migrations

*Trade-off*: Complex SQL queries on individual resume items are harder.

### 2. Defensive AI Engineering Pipeline
Every LLM response passes through strict validation:
```python
def _call_gemini_and_parse(system_instruction, user_message, response_schema):
    # 1. Call Groq with JSON schema enforcement
    # 2. Check finish_reason for safety filters
    # 3. Strip markdown code fences
    # 4. Parse JSON and validate with Pydantic
    # 5. Return validated model or trigger mock fallback
```

*Benefits*: System never crashes from malformed LLM output, rate limits, or safety blocks.

### 3. Synchronous WSGI vs Async Streaming
AI endpoints use standard synchronous Django views instead of SSE streaming:
- **Rationale**: Avoids async ORM complexity, uvicorn configuration, and exotic failure modes
- **UX Solution**: Well-designed skeleton loading states provide excellent perceived performance

*Trade-off*: Users wait ~3-5 seconds for complete responses vs typewriter effect.

### 4. Dual PDF Rendering Strategy
Primary: **WeasyPrint** (superior CSS support, accurate rendering)
Fallback: **xhtml2pdf** (pure Python, no system dependencies)

```python
try:
    from weasyprint import HTML
    pdf_bytes = HTML(string=html_string).write_pdf()
except (ImportError, OSError):
    # Graceful fallback to xhtml2pdf
    from xhtml2pdf import pisa
```

---

##  Security & Authentication

- **Firebase JWT Authentication**: Tokens verified server-side using RSA public keys
- **Session-Based Ownership**: Guest users tracked via Django session keys
- **Credit System**: AI operations deduct tokens from user profile (30 free credits, unlimited for premium)
- **CORS Configuration**: Configured for cross-origin requests between Vercel and Render
- **Input Validation**: JSON Schema validation before any AI processing

---

##  Testing

### Backend Tests
```bash
cd backend
pytest  # Runs all tests in analysis/tests/
pytest --cov=analysis  # With coverage report
```

Test coverage includes:
- Service layer AI integration tests
- API endpoint validation tests
- Mock data fallback scenarios
- PDF rendering tests

### Frontend Testing
```bash
cd frontend
npm run lint  # ESLint validation
npm run build  # Production build verification
```

---

##  Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
3. Deploy automatically on push to main branch

### Backend (Render.com)
1. Create Web Service from GitHub repository
2. Configure:
   - **Build Command**: `pip install -r requirements/base.txt`
   - **Start Command**: `./entrypoint.sh`
   - **Environment Variables**: All `.env` values
   - **Docker**: Enabled (uses `backend/Dockerfile`)
3. Database: Attach Supabase PostgreSQL or use SQLite for demo

---

## 📊 Milestones Completed

| Milestone | Feature | Points | Status |
|-----------|---------|--------|--------|
| M1 | Resume Editor (Full CRUD) | 20 | ✅ |
| M2 | Template Switcher (3 templates + settings) | 25 | ✅ |
| M3 | AI Critique + Auto-Apply Bonus | 35 | ✅ |
| M4 | ATS Score + JD Matching Bonus | 30 | ✅ |
| M5 | PDF Export + Auth/Persistence Bonus | 30 | ✅ |
| **Total** | | **140/140** | ✅ |

**All bonus objectives completed:**
- One-click suggestion application
- Job description keyword matching
- Production PDF pipeline with dual-renderer fallback
- Full authentication and cloud persistence

---

## 🛣️ Future Enhancements

See `REMAINING_FEATURES_BRIEF.md` for planned features:
- Multi-resume dashboard with search/filter
- Collaborative editing
- Advanced analytics dashboard
- Additional template marketplace
- LinkedIn profile import
- Cover letter generation

---

## 📄 License

Standard MIT License

---
  
## 👨‍💻 Author


Built for Redshot Labs Technicak Assessment.

**Tech Assessment Submission** | 2026
