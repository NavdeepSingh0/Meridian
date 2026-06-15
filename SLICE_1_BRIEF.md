# Slice 1 Implementation Brief: Core Loop (Frontend)

**Context:** Backend (all 7 parts of `backend-meridian-SKILL.md`) is complete and working. The previous Stitch-generated frontend screens for the Resume Builder are being discarded due to structural code issues — this brief defines a fresh, self-contained vertical slice covering the highest-value milestones first.

**Why this slice first:** this single slice covers M1 (20 pts), M5 base (15 pts), M3 base+bonus (25+10 = 35 pts), and M4 base+bonus (20+10 = 30 pts) — **95 of the possible 140 points** in one demo-able loop. Everything built after this slice (templates, ATS Checker, PDF export) is additive and lower-risk. If time runs out after this slice, the submission is already strong.

**Scope boundary:** this slice uses **only the Classic template** for the center preview. Modern/Minimal templates and the template switcher are explicitly out of scope (Slice 2). The ATS Checker's separate full-width entry point is also out of scope (Slice 3) — but build the Scored/Feedback panel content as reusable components from the start, since Slice 3 reuses them directly.

**Reference documents:** `ARCHITECTURE.md` §6 (schema), §9.3-9.7 (state management, panel state machine), §6.6 (highlight granularity), `globals.css` (design tokens — colors, typography, shadows, button/card styles). The Stitch prompts file (`STITCH_PROMPTS.md`) Screens 1-3 can be used as a *content/structure reference* (what information goes where) — do not reuse any Stitch-generated code.

---

## 1. Zustand Store

Create the resume store (`lib/store/resumeStore.ts`) holding:

- **`resumeData`** — the full object matching `ARCHITECTURE.md` §6.2's schema exactly. All top-level keys (`basics`, `work`, `education`, `projects`, `skills`, `certificates`, plus the stub arrays `volunteer`, `awards`, `publications`, `languages`, `interests`, `references`) must always be present, defaulting to the "empty document" shape (mirrors the backend's `get_empty_resume_document()` from `resumes/schema.py` — Part 3.1 of the backend SKILL). Do not invent additional top-level keys or rename existing ones.
- **`selectedTemplateId`** — fixed to `"classic"` for this slice (still store it, so Slice 2 just adds switching logic without restructuring state).
- **`panelState`** — one of `'editing' | 'scored' | 'feedback'`, defaulting to `'editing'`.
- **`atsResult`** — holds the last `ATSResult` response (or `null` before first analysis).
- **`critiqueResult`** — holds the last `CritiqueResult` response (or `null` before first "Get feedback").
- **`jobDescription`** — string, defaults to empty. Bound to the JD textarea in the Editing state's right panel.

**Actions needed:**

- Granular setters per section — e.g. `updateBasics(field, value)`, `addWorkEntry()`, `updateWorkEntry(index, field, value)`, `removeWorkEntry(index)`, and equivalents for `education`, `projects`, `skills`, `certificates`. Prefer explicit, named actions over one generic `setState(path, value)` — easier to bind to specific form fields and easier to test.
- `setJobDescription(text)`.
- `startAnalysis()` / `setAtsResult(result)` / `setCritiqueResult(result)` — used by the React Query mutations (Section 3) to update state on success.
- `resetToEditing()` — sets `panelState = 'editing'`, clears `atsResult` and `critiqueResult` to `null`. This is the **Edit** action (Section 5).

**Why explicit actions matter here specifically:** the section forms (Section 2) will bind directly to these actions. If actions are generic/path-based, every form field needs to know its own path into the schema — explicit actions keep that knowledge inside the store, not scattered across components.

---

## 2. localStorage Persistence (M5 base)

- On store creation/app load: attempt to read a single key (e.g. `meridian:resume:v1`) from `localStorage`. If present and parses successfully, hydrate `resumeData`, `selectedTemplateId`, and `jobDescription` from it. If absent or unparseable, fall back to the empty-document default — **never throw or leave `resumeData` partially undefined**.
- On any mutation to `resumeData`, `selectedTemplateId`, or `jobDescription`: debounce (~500ms after the last change) and write the combined object back to the same `localStorage` key.
- `panelState`, `atsResult`, `critiqueResult` are **not** persisted — a page reload should always return to `'editing'` with no stale AI results (re-analysis is cheap and ensures results match current content).

**Verification for this section:** edit a field, reload the page, confirm the edit persists. Confirm a completely fresh browser (no localStorage key) loads a valid, empty-but-fully-shaped resume with no console errors.

---

## 3. API Client + React Query Hooks

Create typed wrapper functions (e.g. `lib/api/analysis.ts`) for the two endpoints this slice needs:

- `postAtsScore(resumeData, jobDescription) → Promise<ATSResult>` — calls `POST /api/analysis/ats-score/` with body `{ resume_data: resumeData, job_description: jobDescription || null }`.
- `postCritique(resumeData) → Promise<CritiqueResult>` — calls `POST /api/analysis/critique/` with body `{ resume_data: resumeData }`.

Wrap each in a React Query `useMutation` hook (`useAtsScore()`, `useCritique()`). These hooks are the *only* things that touch the network in this slice — components call the mutation's `.mutate()`/`.mutateAsync()` and read `.isPending`/`.isError`/`.data` for UI state.

**TypeScript types** (`lib/types/analysis.ts`): mirror the backend Pydantic models exactly —
- `SectionCritique { section: string; score: number; strengths: string[]; improvements: string[] }`
- `CritiqueResult { overall_score: number; overall_feedback: string; sections: SectionCritique[] }`
- `KeywordGap { keyword: string; importance: string }`
- `ATSResult { overall_score: number; summary: string; strengths: string[]; issues: string[]; has_job_description: boolean; missing_keywords: KeywordGap[] }`

`lib/types/resume.ts`: mirror `ARCHITECTURE.md` §6.2 exactly (same field names, nesting, array-vs-object shapes as the backend's `resumes/schema.py`).

**Error handling for this slice:** if either mutation fails (network error, 503 timeout, 422 safety-block, or any non-2xx), the panel shows a simple inline error state with the response's error message (or a generic fallback) and a "Try again" button that re-fires the same mutation. Do **not** fall back to client-side mock data — the backend already handles all mock/fallback logic (Demo Mode, 429 fallback, etc.) per the backend SKILL §5; the frontend's job is just to display whatever the backend returns, including its error responses, faithfully.

---

## 4. Layout & Editing State (M1)

### 4.1 Overall Layout

Build a single page (`/editor` or similar) with a 3-column desktop layout:

- **Top bar** (full width): "Meridian" wordmark (left), "Saved [time]" indicator (right) — no template switcher in this slice (fixed to Classic), no Export PDF button yet (Slice 4).
- **Left column** (~220px): Section Navigator.
- **Center column** (flexible, largest): Live Resume Preview (Classic template).
- **Right column** (~280px): Analysis Panel — content varies by `panelState` (Sections 4.3, 5, 6).

Use `globals.css` tokens directly: `#64B6AC` primary / `#52A49A` hover / `#DAFFEF` surface / `#FCFFFD` base / `#1C2B28` ink / `#4A6260` ink-muted / `#D4E8E4` border, 12px card radius, the layered soft-shadow + inset-highlight card treatment, serif headings / sans body per the established type system. Match the landing page's actual rendered values from `globals.css`, not the earlier Stitch-prompt approximations.

### 4.2 Left Column — Section Navigator

A vertical list: Basics & Summary, Experience, Education, Projects, Skills, Certificates. Required sections (Basics, Experience, Education, Skills) are always shown; Projects and Certificates can use the "add if relevant" dashed-border treatment if empty (per `ARCHITECTURE.md` §6.3's tiering — these sections still exist in `resumeData` as empty arrays regardless, this is purely a UI affordance for whether the form is expanded by default).

Clicking a section expands it **in place** (accordion-style) to show its form fields, collapsing any other expanded section. The expanded section gets the `#DAFFEF` background tint + left-border accent treatment.

**Form fields per section** (all bound to the store actions from Section 1):

- **Basics & Summary**: `name`, `label`, `email`, `phone`, `url`, `summary` (textarea), `location.city`, `location.region`, `location.countryCode`, and a repeatable list for `profiles` (each: `network`, `username`, `url`).
- **Experience (`work`)**: repeatable entries, each with `name`, `position`, `startDate`, `endDate`, `summary`, and a repeatable list of `highlights` (strings — render as a dynamic bullet list with add/remove).
- **Education**: repeatable entries with `institution`, `studyType`, `area`, `startDate`, `endDate`, `score`.
- **Projects**: repeatable entries with `name`, `description`, `url`, repeatable `highlights`, repeatable `keywords`.
- **Skills**: repeatable entries, each with `name` and a repeatable list of `keywords` (render as chip/tag input — add keyword on Enter, remove via small "x").
- **Certificates**: repeatable entries with `name`, `date`, `issuer`, `url`.

Every "repeatable entry" needs add/remove controls (e.g., "+ Add experience" button at the bottom of the Experience form; a small remove icon per entry).

### 4.3 Right Column — Editing State Default

When `panelState === 'editing'`:

- Header label "Analysis" (small, uppercase, letter-spaced, ink-muted — matches Stitch Screen 1's intent).
- Textarea bound to `jobDescription`, placeholder "Paste a job description to check keyword alignment", label "Job description (optional)".
- Primary pill button, full width: **"Analyze resume"**.
- Small helper text below: "Get an ATS score and detailed feedback on your resume."

Clicking "Analyze resume" triggers the flow in Section 5.

### 4.4 Center Column — Classic Template (Live Preview)

A white/porcelain document card (12px radius, 1px `#D4E8E4` border, soft shadow, ~32-40px internal padding) rendering `resumeData` through a `ClassicTemplate` component:

- Centered name (serif, large) + contact line (email · phone · location · profiles, small ink-muted text)
- "SUMMARY" — uppercase small-caps style header with thin bottom border, then `basics.summary` text
- "EXPERIENCE" — same header style, then each `work` entry: title (left) + date range (right, same line), company below, bullet list of `highlights`
- "EDUCATION" — same pattern with `education` entries
- "PROJECTS" — same pattern with `projects` entries (only render this section header if `projects` is non-empty)
- "SKILLS" — same header, then each `skills` entry rendered as `name: keyword, keyword, keyword` (plain text, comma-separated — no chips, per ATS-safety conventions even in the live preview, so what the user sees matches what exports)
- "CERTIFICATES" — same pattern, only if non-empty

**This component is built once here but is the same component Slice 2 will add Modern/Minimal siblings for** — keep `ClassicTemplate` self-contained, taking only `resumeData` as a prop, with no layout assumptions about its container (so it can be dropped into the ATS Checker's results view in Slice 3, or a template-switcher in Slice 2, unchanged).

The preview updates live as the user types in the left column (no debounce needed for the visual preview itself — only the localStorage write is debounced).

---

## 5. Analyze Resume → Scored State (M4 base + bonus)

**Trigger:** user clicks "Analyze resume" (Section 4.3).

**Flow:**

1. Call `useAtsScore().mutate({ resumeData, jobDescription })` (Section 3).
2. While pending: right panel shows a loading skeleton shaped like the eventual Scored panel (placeholder score circle, placeholder text blocks). Left column and center preview begin showing their "locked" visual treatment immediately (don't wait for the response) — reduced-opacity/non-interactive left sidebar, and a subtle lock indicator or border-color shift on the center document card.
3. On success: store the result via `setAtsResult(result)`, set `panelState = 'scored'`.
4. On error: show inline error + "Try again" (Section 3) — `panelState` stays `'editing'`, left/center revert to unlocked (since analysis didn't actually complete).

**Scored state right panel** (`panelState === 'scored'`):

- Header label "ATS score" (small, uppercase, ink-muted).
- Large numeric score in serif font: `{atsResult.overall_score}` + smaller `/100` beside it.
- `atsResult.summary` as 1-2 sentences of body text.
- Thin divider.
- "Strengths" subsection — small label + bullet list from `atsResult.strengths`.
- "Issues" subsection — small label in a muted warm tone (not bright red — pick a desaturated terracotta consistent with `globals.css`'s palette if such a token exists, otherwise a low-saturation warm color that doesn't clash with the teal/mint scheme) + bullet list from `atsResult.issues`.
- If `atsResult.has_job_description` is true and `atsResult.missing_keywords` is non-empty: "Missing keywords" subsection rendering each `KeywordGap` as a small chip (`#DAFFEF` background, dark teal text, 6px radius) — chip text shows `keyword`, and `importance` can be a small secondary indicator (e.g., subtle color/weight variation) if it's easy, but isn't critical for this slice.
- Two buttons at the bottom: primary pill **"Get feedback"** (wider) and secondary/ghost **"Edit"** (smaller), side by side.

**Left column** stays in its locked/reduced-opacity state. **Center column** stays read-only with its lock indicator.

---

## 6. Get Feedback → Feedback State (M3 base + bonus)

**Trigger:** user clicks "Get feedback" from the Scored state.

**Flow:**

1. Call `useCritique().mutate({ resumeData })` (Section 3).
2. While pending: right panel shows a feedback-shaped loading skeleton (placeholder critique cards). Left/center remain in their locked state from Section 5.
3. On success: store via `setCritiqueResult(result)`, set `panelState = 'feedback'`.
4. On error: inline error + "Try again" — `panelState` stays `'scored'` (the score result is still valid and shown; only the feedback fetch failed).

**Feedback state right panel** (`panelState === 'feedback'`):

- Header label "Feedback" (small, uppercase, ink-muted), with a small ghost link/button **"Back to score"** beneath it — clicking this sets `panelState = 'scored'` again (no new API call; `atsResult` is still in state) without resetting `critiqueResult`, so the user can toggle between score and feedback views freely once both exist.
- A vertical list of critique cards, one per `critiqueResult.sections[i]` entry:
  - Small numbered circle marker (`#64B6AC` background, white number, sans-serif) — number is just the array index + 1.
  - Section label derived from `SectionCritique.section` (e.g., map `"work"` → "Experience", `"education"` → "Education", `"skills"` → "Skills", `"basics"` → "Summary", `"projects"` → "Projects", `"certificates"` → "Certificates" — a simple lookup table).
  - "Strengths" / "Improvements" content from the entry's `strengths[]` / `improvements[]` arrays — render as short bullet lists within the card. (The Stitch-spec framing of "Issue" + "Suggestion" maps onto `improvements[]` entries — each improvement string is itself the suggestion text; don't over-engineer separate issue/suggestion fields beyond what the Pydantic schema actually returns.)
- At the bottom of the panel: secondary ghost button **"Edit"**, full width.

**Center column — highlight overlays (§6.6, section-level):**

For each `critiqueResult.sections[i]` entry, find the corresponding section block in `ClassicTemplate`'s rendered output (using the same section-name mapping as above — `"work"` → the Experience section block, etc.) and apply:

- A `#DAFFEF` background tint behind that entire section block.
- A 1.5px left border in `#64B6AC` (square corner on that side) along the highlighted block.
- A small numbered circle marker (same style as the right panel's markers, same number `i+1`) positioned at the top-left or top-right corner of the highlighted block.

**Implementation approach:** `ClassicTemplate` should accept an optional prop like `highlightedSections: { section: string; marker: number }[]` (derived from `critiqueResult.sections` when `panelState === 'feedback'`, otherwise empty/undefined). The template wraps each of its section blocks (Summary/Experience/Education/Projects/Skills/Certificates) in a way that can conditionally apply the highlight styling + marker based on whether that block's section name appears in `highlightedSections` — this keeps the highlight logic inside the template component, driven by a simple prop, rather than the parent reaching into the template's DOM.

The numbered markers in the right panel's critique cards and the center preview's highlights must use the **same numbers** for the same section (both derived from `critiqueResult.sections` array index) — this is the visual link between "here's the problem" (center) and "here's why and what to do" (right panel).

---

## 7. Edit Action (Returns to Editing)

Available as a button in both the Scored state (Section 5) and Feedback state (Section 6) right panels.

**On click:** call `resetToEditing()` (Section 1) — this sets `panelState = 'editing'`, clears `atsResult` and `critiqueResult` to `null`. Consequences that should follow automatically from these state changes (via conditional rendering, not separate actions):

- Right panel reverts to the Section 4.3 default (JD textarea + "Analyze resume" button).
- Left column's locked/reduced-opacity treatment is removed — sections become interactive again.
- Center column's lock indicator is removed, highlight overlays disappear (since `critiqueResult` is `null`, `highlightedSections` becomes empty).

`resumeData`, `selectedTemplateId`, and `jobDescription` are **not** cleared by Edit — only the analysis results and panel state reset. The user's content and JD remain exactly as they were, ready for further edits or immediate re-analysis.

---

## 8. Definition of Done for Slice 1

- Fresh page load with empty `localStorage`: shows a valid, empty Classic-template resume with all section forms accessible and empty.
- User fills in all required sections (Basics, at least one Experience entry, at least one Education entry, at least one Skills entry) — center preview updates live, matching what was typed.
- Reload the page: all entered content persists (localStorage round-trip).
- Click "Analyze resume" (with or without a job description): loading state shows, left/center lock, then Scored state renders with real `overall_score`, `summary`, `strengths`, `issues` from the backend (real Gemini or Demo Mode mock — both should produce a coherent Scored state, since the backend handles that distinction transparently per backend SKILL §5).
- If a job description was provided and the backend returns `missing_keywords`, chips render in the Scored panel.
- Click "Get feedback": loading state shows, then Feedback state renders critique cards with numbered markers; center preview shows matching numbered highlight overlays on the corresponding sections.
- Click "Back to score" (from Feedback): returns to Scored panel content without a new API call, `critiqueResult` still available for toggling back.
- Click "Edit" (from either Scored or Feedback): returns to Editing state, sidebar/preview unlock, highlights clear, `atsResult`/`critiqueResult` cleared, "Analyze resume" button available again.
- Trigger an error path (e.g., temporarily point the API base URL at a wrong port, or stop the backend) and confirm the inline error + "Try again" UI appears rather than a crash or blank panel.
- No console errors at any point in the above flow.

---

## Explicitly Out of Scope for Slice 1 (deferred to later slices)

- Template switcher, Modern/Minimal templates (Slice 2).
- ATS Checker full-width entry point (Slice 3) — but `ATSScorePanel`/`CritiqueFeedbackList`-equivalent components built here should be structured so Slice 3 can reuse them in a different container without rewriting.
- Export PDF button/wiring (Slice 4) — backend endpoint already exists and works; just not connected to UI yet.
- README, Loom recording (Slice 4).
- Entry/line-level highlight precision (explicitly deferred per `ARCHITECTURE.md` §6.6 — section-level only).
