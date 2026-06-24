# Meridian — Remaining Features Implementation Brief

**Context:** Meridian CV is a fully functional AI-powered resume builder. Auth (Supabase), the Builder, the ATS Checker, all three templates, PDF export, and Gemini AI integration are all complete and deployed. This brief covers the remaining features needed to complete the product.

**Reference:** `ARCHITECTURE.md` for schema (§6.2), design tokens (`globals.css`), and existing patterns. All new code must follow existing conventions — same CSS token usage, same Zustand/React Query patterns, same Django service-layer structure.

**Scope of this brief (4 feature areas):**
1. App title fix
2. Documents page (resume library)
3. ATS Checker — redesign + PDF upload/parse flow
4. Backend — PDF parse endpoint

Execute in order. Each section has its own Definition of Done.

---

## Feature 1 — App Title Fix

**Problem:** The browser tab and page `<title>` shows `[AppName]` or similar placeholder text everywhere.

**Fix:** Update `apps/web/app/layout.tsx` (and any page-level `metadata` exports that override it) to use `"Meridian CV"` as the base title. Use Next.js's `metadata` API with a `title` template so individual pages get contextual titles:

- Default / landing: `"Meridian CV — AI-Powered Resume Builder"`
- Builder: `"Resume Builder — Meridian CV"`
- ATS Checker: `"ATS Checker — Meridian CV"`
- Documents: `"My Resumes — Meridian CV"`
- Auth pages: `"Sign In — Meridian CV"` / `"Create Account — Meridian CV"`

Use Next.js's `{ title: { template: '%s — Meridian CV', default: 'Meridian CV' } }` pattern in the root layout's `metadata` export. Individual pages then just export `metadata = { title: 'Resume Builder' }` and the template handles the rest.

**Definition of done:** Every browser tab shows a meaningful, non-placeholder title matching the page the user is on.

---

## Feature 2 — Documents Page

### 2.1 Overview

The Documents page (`/documents`) is the user's resume library — a dashboard showing all resumes they've saved to the cloud (Supabase), with the ability to open, rename, duplicate, delete, and create new ones. The "Documents" breadcrumb in the Builder's top nav already links here — this page completes that flow.

This page is **authenticated-only** — redirect unauthenticated users to the sign-in page. Authenticated users see their resumes fetched from the `/api/resumes/` Django endpoint (session-scoped via Supabase JWT, already exists per the backend).

### 2.2 Page Layout

**Top bar:** matches the Builder's `saasTopNav` style — "Meridian CV" wordmark (left), user avatar/email + sign-out option (right). No template switcher, no export button here.

**Page header area:**
- Left: heading "My Resumes" (serif, large — matches the app's editorial heading style)
- Right: a primary pill button **"New Resume"** — creates a new empty resume document (explained in §2.4)

**Resume grid:** a responsive grid of resume cards (3 columns on desktop, 2 on tablet, 1 on mobile). Each card:
- A thumbnail preview area — render a small, scaled-down version of the resume's `ClassicTemplate` (or whichever `template_id` the resume uses) using the stored `document_data`. Use CSS `transform: scale()` to fit the full resume layout into the card thumbnail, similar to how Notion/Google Docs shows page previews. This is purely visual — read-only, non-interactive.
- Resume title below the thumbnail (editable inline on click — single click on the title text makes it an `<input>` that commits on blur/Enter, calls `PATCH /api/resumes/{id}/` with the new title)
- Last modified date in ink-muted small text ("Edited 2 hours ago" format, relative time)
- A three-dot (`⋯`) overflow menu on hover/focus revealing: "Open", "Duplicate", "Delete"

**Empty state:** if the user has no saved resumes yet, show a centered empty state: a subtle document icon (thin-line style, teal), a short message ("You haven't saved any resumes yet"), and the "New Resume" primary button repeated here. No filler content, no fake resume cards.

### 2.3 Data Layer

**React Query hooks** (`lib/api/resumeApi.ts` and `lib/hooks/useResumes.ts`):

- `useResumes()` — `GET /api/resumes/` — fetches the list of all resumes for the current user. Returns array of `{ id, title, template_id, document_data, created_at, updated_at }`.
- `useCreateResume()` — `POST /api/resumes/` — creates a new resume with empty `document_data` (the full §6.2 empty document shape), `title: "Untitled"`, `template_id: "classic"`.
- `useUpdateResume(id)` — `PATCH /api/resumes/{id}/` — used for inline title rename and any other metadata updates.
- `useDuplicateResume(id)` — `POST /api/resumes/` with the source resume's `document_data` and `title: "{original title} (copy)"`.
- `useDeleteResume(id)` — `DELETE /api/resumes/{id}/` — with a confirmation step (a simple inline confirmation replacing the card, or a minimal modal — not a full dialog, just "Are you sure? Delete / Cancel" inline).

All mutations should optimistically update the React Query cache for the `useResumes()` query so the UI feels instant.

### 2.4 Navigation Flow

- **"New Resume" button:** calls `useCreateResume()`, then on success navigates to `/builder?id={new_resume_id}` — the Builder opens with the new empty resume loaded.
- **Clicking a resume card (or "Open" in overflow menu):** navigates to `/builder?id={resume_id}` — the Builder loads that resume's `document_data` into the Zustand store.
- **"Duplicate":** creates a copy via `useDuplicateResume`, stays on the Documents page, new card appears in the grid.
- **"Delete":** removes the card from the grid. If the deleted resume is currently open in the Builder's localStorage, clear localStorage and reset the store to the empty default on next Builder visit.

### 2.5 Builder ↔ Documents Integration

The Builder currently reads/writes only localStorage. With the Documents page now active, the Builder needs to be aware of whether it's editing a DB-backed resume (navigated from Documents) or a local-only resume (navigated directly to `/builder` without an `id` param):

- If `/builder?id={id}` is present: on mount, fetch `GET /api/resumes/{id}/` and load `document_data` into the Zustand store. Auto-save (debounced, ~2 seconds after last change) via `PATCH /api/resumes/{id}/` alongside the existing localStorage write. The top nav's save indicator should reflect the DB save status ("Saving..." / "Saved to cloud").
- If `/builder` with no `id`: existing behavior — localStorage only, "Saved to browser" indicator as currently.

This means `resumeStore.ts` needs a new optional `currentResumeId: string | null` state field. If non-null, the debounced persistence side-effect calls the API in addition to localStorage. If null, localStorage only. The store action `loadResumeFromDB(resumeData, id)` sets both `resumeData` and `currentResumeId` atomically.

**Do not** change the existing localStorage behavior for the local (no-id) flow — it must remain fully functional for users who don't log in or navigate directly to `/builder`.

### 2.6 Documents Page Styling

Use the existing design system tokens throughout: `#FCFFFD` page background, card style matching the Builder's panel cards (12px radius, 1px `#D4E8E4` border, soft layered shadow), `#64B6AC` primary button, serif heading for "My Resumes", inline title editing uses the standard input style (1px `#D4E8E4` border, 8px radius, focus → `#64B6AC` border). The overall feel should match the Builder — same nav, same typography, not a different visual language.

**Definition of done:** authenticated user can see all their saved resumes in a grid, create a new one (opens in Builder), open an existing one (opens in Builder with their data), rename inline, duplicate, and delete. Changes made in the Builder (when navigated from Documents) auto-save to the DB. Unauthenticated users are redirected to sign-in.

---

## Feature 3 — ATS Checker Redesign + PDF Upload Flow

### 3.1 The Problem

The current ATS Checker (`/checker`) has two issues:
1. It feels empty — large whitespace on the right side when in the idle/pre-analysis state.
2. The only way to use it is if you've already built a resume in the Builder. Users with an existing resume (PDF from a different tool) have no entry point.

### 3.2 The Solution: Two Entry Modes

The ATS Checker becomes a proper dual-entry tool:

**Mode A — "Use my Meridian resume"** (existing flow, improved visually)
Uses `resumeData` from the Zustand store exactly as today.

**Mode B — "Upload a PDF resume"** (new flow)
User uploads a PDF → backend parses it into `resumeData` JSON → that data is loaded into the store → the existing ATS analysis flow proceeds exactly as Mode A from that point forward. Once parsed, the user can also optionally "Open in Builder" to edit the parsed resume.

### 3.3 Checker Page Redesign — Idle State

The idle/pre-analysis state (before "Analyze Match" is clicked) needs to feel purposeful, not empty. Redesign the right panel as follows:

**When no resume data exists in store (completely fresh user):**
Show only Mode B (upload prompt) — it makes no sense to offer "use my Meridian resume" to a user who has no resume yet. Display a centered upload area (described in §3.4) plus the JD textarea below it.

**When resume data exists in store:**
Show a mode switcher at the top of the right panel — two options presented as toggle/tabs or two distinct cards:
- **"My Meridian Resume"** — shows a small summary of the loaded resume (name + last section count or "last edited X") as confirmation of which resume will be analyzed, plus the JD textarea below.
- **"Upload a PDF"** — shows the upload area (§3.4) instead, replacing the Meridian resume for this analysis.

Below the mode switcher (in both modes): the existing JD textarea ("Paste a job description to check keyword alignment" — optional), and the "Analyze Match" primary button.

**Left side (resume preview canvas):** stays as-is when Mode A is active (renders current store's resume). When Mode B is active and a PDF has been uploaded but not yet parsed, show a loading skeleton in the canvas area. Once parsed, render the parsed resume in the canvas (loads into store). This gives the user visual confirmation of what was extracted before they run the analysis.

### 3.4 PDF Upload Component

A drag-and-drop upload area styled consistently with the design system:
- A dashed 1.5px `#D4E8E4` border rectangle (8px radius), `#FCFFFD` background, with a thin-line document/upload icon (teal, center) and text "Drag a PDF here, or click to browse"
- Accepted file types: `.pdf` only. Max file size: 5MB (validate client-side before upload, show inline error if exceeded).
- On file selection/drop: immediately upload to `POST /api/analysis/parse-pdf/` (new backend endpoint — §4). Show a loading state within the upload area ("Parsing your resume..." with a subtle animated indicator — not a full-page spinner).
- On success: the returned `resumeData` JSON is loaded into the Zustand store via `loadResumeFromDB` (or a new `loadResumeFromPDF` action that sets `resumeData` but leaves `currentResumeId` null — this is a parsed-but-not-yet-saved resume). The canvas re-renders with the parsed content. The upload area is replaced by a small success confirmation ("Resume parsed ✓ — [detected name]") with an "Upload a different PDF" ghost link to reset.
- On error: inline error message within the upload area ("Could not parse this PDF — try a text-based PDF, not a scanned image"), "Try again" link.

### 3.5 Documents Page — PDF Upload Entry Point

The Documents page also needs a PDF upload path so users can import an existing resume into their library:

Add a secondary ghost button **"Import PDF"** next to the "New Resume" primary button in the Documents page header. Clicking it opens a minimal modal (or an inline expanded area — not a full-page navigation) with:
- The same drag-and-drop upload component from §3.4
- On successful parse: creates a new resume via `POST /api/resumes/` with the parsed `document_data` and `title` set to the detected name (from `basics.name`) or "Imported Resume" as fallback, then navigates to `/builder?id={new_id}` — the Builder opens with the parsed resume, ready to edit and refine.

### 3.6 "Open in Builder" from Checker

After parsing a PDF in the Checker (Mode B), add a secondary ghost button **"Open in Builder"** that appears alongside "Analyze Match" once parsing is complete. This navigates to `/builder` (no id, local-only) with the parsed `resumeData` already in the store — the user can edit the parsed resume in the Builder and then save it to their Documents library from there.

**Definition of done for Feature 3:** ATS Checker right panel has no empty/wasted space in idle state. Users can upload a PDF, see it parsed into the resume canvas, run ATS analysis on it, and optionally open it in the Builder. Documents page has an "Import PDF" button that parses and saves to the library. All error states (oversized file, non-PDF, unreadable/scanned PDF, parse failure) are handled gracefully with clear inline messages.

---

## Feature 4 — Backend: PDF Parse Endpoint

### 4.1 New Endpoint

`POST /api/analysis/parse-pdf/`

Accepts: `multipart/form-data` with a single field `file` containing the uploaded PDF.
Returns: a JSON object `{ resume_data: {...} }` where `resume_data` is a fully-formed §6.2 JSON Resume schema object populated from the PDF's content.

### 4.2 Implementation in `analysis/` app

Add `parse_resume_pdf_upload(pdf_bytes: bytes) -> dict` to `analysis/services.py`.

The function:

1. **Extract text from the PDF bytes.** Use `pdfplumber` (preferred — better text extraction than PyPDF2, handles multi-column layouts better) or `PyPDF2` as a fallback. Install `pdfplumber` in `requirements/base.txt`. Extract text page by page, join with newlines. If extracted text is empty or under ~100 characters (likely a scanned image PDF, not text-based), raise a specific error condition that the view layer translates to `422` with the message: "This PDF appears to be a scanned image. Please upload a text-based PDF." Do not attempt to parse an empty or near-empty text blob — it will produce hallucinated resume data.

2. **Send extracted text to Gemini for schema extraction.** Use the existing Gemini client from `analysis/gemini_client.py`. This is a new prompt (not the critique/ATS prompts) — instruct the model to act as a resume parser, read the raw text, and output a JSON object exactly matching the §6.2 schema structure. The system prompt must: embed the full §6.2 schema field names and their meanings (e.g., `work` = employment history, `highlights` = bullet points per role, `basics.label` = job title/headline); instruct the model to leave fields as empty strings `""` or empty arrays `[]` if information is not found rather than fabricating content; instruct it to normalize dates to `"MM/YYYY"` format where detectable; and enforce `responseMimeType: "application/json"` with a `responseSchema` matching the §6.2 shape. Use the same defensive parsing pipeline as the other AI endpoints (strip markdown fences, `json.loads`, Pydantic/jsonschema validation before returning). On validation failure, fall back to the empty-document default from `get_empty_resume_document()` with whatever was extractable in `basics.name` at minimum (so the user gets something rather than a blank form).

3. **Return the parsed dict.** The view wraps it in `{ "resume_data": parsed_dict }` and returns `200`.

### 4.3 View and Routing

Add `ParsePDFView` to `analysis/views.py` — `APIView` subclass with a `post()` method. Use DRF's `request.FILES` to access the uploaded file. Validate: file present, file extension is `.pdf`, file size under 5MB (return `400` with a clear message if either fails). Extract bytes, call `parse_resume_pdf_upload()`, return result.

Wire to `/api/analysis/parse-pdf/` in `analysis/urls.py`.

### 4.4 Error Handling Hierarchy for Parse Endpoint

- No file uploaded → `400` "No file provided"
- Non-PDF file type → `400` "Only PDF files are accepted"
- File over 5MB → `400` "File too large (max 5MB)"
- Empty/scanned PDF (text extraction yields <100 chars) → `422` "This PDF appears to be a scanned image. Please upload a text-based PDF."
- Gemini API error (429) → fall back to `get_empty_resume_document()` populated with whatever was extracted, return `200` with a `warning` field in the response: `{ "resume_data": {...}, "warning": "AI parsing unavailable — basic extraction used" }`. The frontend should surface this warning inline ("Resume imported with basic extraction — some fields may need to be filled in manually").
- Gemini structured output validation failure → same as 429 fallback behavior above.
- Generic unexpected error → `500` with a generic message, full traceback logged server-side.

### 4.5 Demo Mode

Per the existing pattern: if `GEMINI_API_KEY` is unset, return a mock parsed resume (a realistic sample `document_data` matching §6.2 — can be the same mock data used elsewhere in `analysis/mock_data.py`) with a `warning` field noting it's demo output. This means the upload flow is testable end-to-end without a live API key.

**Definition of done for Feature 4:** `POST /api/analysis/parse-pdf/` with a real, text-based PDF resume (e.g., a PDF exported from the Builder itself) returns a `200` with a `resume_data` object that correctly extracts name, contact info, work experience, education, and skills into the §6.2 schema. All error cases return appropriate status codes and readable messages.

---

## Execution Order

| # | Feature | Complexity | Blocks |
|---|---|---|---|
| 1 | App title fix | Trivial | Nothing |
| 4 | Backend parse-pdf endpoint | Medium | Feature 3 |
| 3.4 | PDF upload component (standalone) | Medium | Features 3, 3.5 |
| 2.3 | Documents data layer (React Query hooks) | Medium | Feature 2 UI |
| 2.2 | Documents page UI (grid, cards, empty state) | Medium | Nothing else |
| 2.5 | Builder ↔ Documents integration (id-based load + autosave) | Medium-Complex | Feature 2 |
| 3.3 | ATS Checker right panel redesign (idle state, mode switcher) | Medium | Feature 3.4 |
| 3.5 | Documents page Import PDF button | Simple | Features 3.4, 4 |
| 3.6 | "Open in Builder" from Checker | Simple | Feature 3 |

Start with Feature 1 (5 minutes, zero risk). Then Feature 4 (backend, can be done in parallel with frontend work). Then the PDF upload component as a standalone reusable component before integrating it into either page. Then Documents. Then Checker redesign.

---

## Notes on Reuse

- The PDF upload drag-and-drop component (§3.4) is written **once** as `components/ui/PdfUploadZone.tsx` and used in both the Checker (§3.3) and the Documents page (§3.5). It takes props: `onParsed: (resumeData: ResumeSchema) => void`, `onError: (message: string) => void`, `isLoading: boolean`. The actual API call happens inside the component (using React Query's `useMutation` wrapping `POST /api/analysis/parse-pdf/`). This keeps both integration sites clean.

- `AtsScoreView` and `CritiqueFeedbackView` components (already extracted in Slice 3) are reused as-is in the redesigned Checker — no changes to those components needed.

- The `ClassicTemplate`, `ModernTemplate`, `MinimalTemplate` components are already self-contained and prop-driven — the Documents page's thumbnail previews just render whichever template matches each resume's `template_id`, scaled down via CSS transform. No template changes needed.
