# Landing Page — Full Design & Code Prompt
## AI-Powered Resume Builder · Premium Landing Page

> **NOTE TO GEMINI:** This is a complete, non-negotiable design brief. Do not deviate from any decision documented here. Do not add AI-themed visual language (no robot icons, no neural network illustrations, no gradient brain graphics, no floating orb animations). Do not use stock SaaS purple/indigo/blue color schemes. Do not use generic button text like "Get Started" or "Try for Free." Every decision in this document exists for a reason — execute it precisely.

---

## 1. Application Identity

**App name:** `[AppName]` — use this as a placeholder; it will be replaced. Place it in the top-left of the navbar as a wordmark only (no icon/logo beside it for now). Use the same font as the UI body but set to `font-weight: 600`, letter-spacing slightly tightened (`-0.02em`).

**What this product is:** A resume builder and ATS analysis tool. It is a precision instrument for job seekers — not a content generator, not a chatbot, not an AI assistant. It is a professional tool that happens to use AI under the hood, invisibly, the way a spell-checker does. The product's identity is **craft**, **clarity**, and **control** — not artificial intelligence.

**Tone of the entire page:** Editorial. Restrained. Confident. The visual language should feel closer to a design studio's portfolio site or a premium SaaS like Linear or Notion than to an AI-first tool like Jasper or Copy.ai. Every element should feel considered, not generated.

---

## 2. Color System (Exact — Do Not Substitute)

These three colors are the complete palette. Everything on the page is derived from these three values. No additional brand colors are introduced.

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--color-primary` | `#64B6AC` | Tropical Teal | Primary action buttons, active states, section accents, score indicators, key stat numbers |
| `--color-surface` | `#DAFFEF` | Frozen Water | Subtle section backgrounds, feature card backgrounds, hover states, skill chip backgrounds |
| `--color-base` | `#FCFFFD` | Porcelain | Page background, navbar background, card backgrounds on white sections |
| `--color-ink` | `#1C2B28` | Deep Forest | All body text, headings, nav links — a dark forest-slate, NOT pure black |
| `--color-ink-muted` | `#4A6260` | Muted Teal-Slate | Subheadings, secondary labels, captions, placeholder text |
| `--color-border` | `#D4E8E4` | Soft Teal Border | Dividers, input borders, card outlines — very low contrast, barely-there |
| `--color-primary-hover` | `#52A49A` | Teal Depth | Hover state for `--color-primary` buttons/links |

**Critical rules:**
- Never use pure `#000000` black or `#ffffff` white. Use `--color-ink` and `--color-base` respectively.
- The primary teal (`#64B6AC`) is used **sparingly** — it should appear on 3–5 elements per section maximum. It draws the eye precisely because it isn't everywhere.
- No gradients on text. No rainbow or multi-stop gradients anywhere. The only permitted gradient is a very subtle vertical `#FCFFFD → #F0FAF6` on the hero section background, barely perceptible.
- No glassmorphism, no frosted blur panels, no neon glows. The aesthetic is flat-light, editorial, paper-like.

---

## 3. Typography

**Font stack:** Import from Google Fonts:
- **Display / Headings:** `Instrument Serif` — used exclusively for the hero headline (H1), section main headings (H2), and any large pull-quote-style numbers or stats. This gives the editorial, slightly literary weight that separates this from generic SaaS.
- **UI / Body:** `Inter` — all body copy, nav links, button labels, form labels, feature descriptions, captions. Set as the default `font-family`.

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
```

**Type scale:**

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Hero H1 | Instrument Serif | `clamp(3rem, 6vw, 5.5rem)` | 400 (regular) | 1.05 | `-0.02em` |
| H2 Section | Instrument Serif | `clamp(2rem, 3.5vw, 3rem)` | 400 | 1.1 | `-0.01em` |
| H3 Card | Inter | `1.125rem` | 600 | 1.3 | `-0.01em` |
| Body large | Inter | `1.0625rem` | 400 | 1.7 | `0` |
| Body default | Inter | `0.9375rem` | 400 | 1.65 | `0` |
| Label / Caption | Inter | `0.8125rem` | 500 | 1.4 | `0.04em` |
| Button | Inter | `0.9375rem` | 500 | 1 | `0.01em` |
| Stat number | Instrument Serif | `clamp(3rem, 4vw, 4rem)` | 400 | 1 | `-0.02em` |

**No bold headings.** `Instrument Serif` at weight 400 with large size already has natural authority. Do not set headings to 700 or 800 — it looks generic and heavy.

---

## 4. Spacing & Layout Principles

- **Max content width:** `1200px`, centered with `auto` horizontal margins.
- **Section vertical padding:** `clamp(80px, 10vw, 140px)` top and bottom for major sections, `clamp(48px, 6vw, 80px)` for tighter utility sections.
- **Grid:** 12-column CSS Grid for internal section layouts. Use `gap: clamp(24px, 3vw, 48px)`.
- **Section transitions:** Alternate between `--color-base` (porcelain) and `--color-surface` (frozen water) for section backgrounds, creating a gentle rhythm without using color borders as dividers.
- **Border-radius:** Consistent `12px` for cards and containers, `8px` for inputs, `6px` for chips/tags, `999px` for pill buttons.
- **Tactile Depth & Shadows:** Cards and mockups must retain stacked, multi-layered smooth shadows to give them physical "cardstock" weight. Ensure a `1px` inner white border (`box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8)`) is applied to cards to enhance this tactile depth.
  - **Card resting:** `0 1px 3px rgba(28, 43, 40, 0.06), 0 4px 16px rgba(28, 43, 40, 0.04)`
  - **Card hover/elevated:** `0 4px 20px rgba(28, 43, 40, 0.10), 0 1px 3px rgba(28, 43, 40, 0.06)`
  - No colored shadows, no heavy drop shadows, no heavy inset shadows (other than the 1px white rim).

---

## 5. Navigation Bar

**Behavior:** Fixed to top. `backdrop-filter: blur(12px)` with `background: rgba(252, 255, 253, 0.88)`. Thin bottom border: `1px solid var(--color-border)`. Height: `64px`.

**Left:** App wordmark (`[AppName]`) in `--color-ink`, `Inter` 600, 1rem, letter-spacing `-0.02em`.

**Center (desktop only):** Three navigation links — `Features`, `How it works`, `Templates`. Style: `Inter` 400, `0.9375rem`, `--color-ink-muted`. On hover: color transitions to `--color-ink`, transition `200ms ease`. No underlines, no filled backgrounds.

**Right:**
- Ghost link: `Sign in` — `Inter` 500, `--color-ink-muted`, no border.
- Primary button: `Get started` — filled, `background: var(--color-primary)`, `color: #fff`, `border-radius: 999px`, `padding: 10px 20px`, `font-size: 0.9375rem`, `font-weight: 500`. On hover: `background: var(--color-primary-hover)`, `transform: translateY(-1px)`, transition `150ms ease`.

**Mobile:** Hamburger icon (3 lines, `--color-ink`, 1.5px stroke). Menu opens as a full-width slide-down drawer with `background: var(--color-base)`, links stacked vertically with `24px` top/bottom padding each. Primary button sits at the bottom of the drawer.

---

## 6. Hero Section

**Background:** Reverted to vibrant Tropical Teal (`var(--color-primary)`). No background images, no illustrations, no particles, no animated blobs. **Crucially**, at the absolute bottom of the Hero section container, implement an asymmetrical, organic curve SVG (a smooth, gentle hillside or an elegant wave overlapping the teal—not a harsh black line or deep bowl). The fill of this SVG must strictly match `var(--color-surface)` to transition seamlessly into the section below it.

**Layout:** Centered single-column, `max-width: 760px`, within the `1200px` page container. Vertically padded `clamp(100px, 14vw, 160px)` from the navbar bottom.

**Structure (top to bottom):**

1. **Eyebrow label** (above H1):
   - A small pill: `border: 1px solid var(--color-border)`, `background: var(--color-surface)`, `border-radius: 999px`, `padding: 6px 14px`.
   - Text: `Inter` 500, `0.8125rem`, `--color-ink-muted`, letter-spacing `0.04em`, UPPERCASE.
   - Content: `RESUME BUILDER & ATS ANALYZER`

2. **H1 headline:**
   - `Instrument Serif` 400, `clamp(3rem, 6vw, 5.5rem)`, `var(--color-base)` (Porcelain white), line-height `1.05`.
   - Content (two lines):
     ```
     Your resume,
     hire-ready.
     ```
   - The word "hire-ready" should be in `font-style: italic` AND set to `color: var(--color-ink)` (Deep Forest) for sharp contrast against the teal background.
   - NO gradient text, NO underline decoration, NO highlighted background on any word.

3. **Subheadline paragraph:**
   - `Inter` 400, `1.0625rem`, `var(--color-base)` (Porcelain white, slightly transparent if needed for hierarchy), line-height `1.7`, `max-width: 520px`, centered.
   - Content: `Build a polished resume in minutes. Get section-by-section feedback, pinpoint ATS gaps, and walk into every application with a resume that works as hard as you do.`

4. **CTA button row:**
   - Two buttons, horizontally centered with `16px` gap, `flex-wrap: wrap` for mobile.
   - **Primary:** `Build your resume →` — filled button with `background: var(--color-ink)` and `color: #FCFFFD` (Deep Forest with white text), slightly larger: `padding: 14px 28px`, `font-size: 1rem`. Arrow is a proper `→` character, not an SVG icon.
   - **Secondary:** `Check ATS score` — `border: 1.5px solid var(--color-border)`, `background: transparent`, `color: var(--color-ink)`, same sizing as primary. On hover: `border-color: var(--color-primary)`, `color: var(--color-primary)`, transition `150ms ease`.

5. **Trust line** (below buttons, `margin-top: 20px`):
   - `Inter` 400, `0.8125rem`, `--color-ink-muted`, centered.
   - Content: `No account needed · Saves automatically · Export as PDF`
   - Dots are `·` characters, styled `color: var(--color-primary)`, not bullet points.

6. **Hero visual — product screenshot mockup:**
   - `margin-top: clamp(48px, 7vw, 80px)`.
   - A `border-radius: 16px` container with the card resting shadow.
   - Inside: a high-fidelity static screenshot or styled HTML mockup of the resume builder's 3-column editor interface (left section nav, center live preview of a resume, right analysis panel). This is the product's own UI — not a generic illustration.
   - Thin `1px solid var(--color-border)` border on the container.
   - Above the container, a thin browser chrome bar (just the 3 traffic-light circles in the correct macOS colors + a subtle URL bar in `--color-surface`) to give it the "product in browser" context.
   - The screenshot fades out at the bottom (`mask-image: linear-gradient(to bottom, black 70%, transparent 100%)`) so it transitions smoothly into the next section.

---

## 7. Social Proof Bar / Stats Section

**Background:** `--color-surface` (Frozen Water). **No** section heading — this is purely a strip of numbers and context.

**Layout:** Centered row of 3 stats, equal spacing, dividers (`1px solid var(--color-border)`) between them on desktop. Stacks to 3 rows on mobile.

**Macro-Typography:** Place giant, low-opacity watermark numbers behind the metrics to add a premium editorial feel.

| Stat | Label |
|---|---|
| `98%` | ATS parse rate across all templates |
| `< 5 min` | Average time to a complete resume |
| `3` | Professional templates, export-ready |

**Number styling:** `Instrument Serif` 400, `clamp(2.5rem, 3.5vw, 3.5rem)`, `--color-primary`. Label below in `Inter` 400, `0.9375rem`, `--color-ink-muted`.

No icons beside the stats. Numbers speak for themselves.

---

## 8. Features Section

**Background:** `--color-base`. **Section heading:** `Instrument Serif`, `clamp(2rem, 3.5vw, 3rem)`, centered, `--color-ink`. Content: `Everything your resume needs.`

**Subhead:** `Inter` 400, `1.0625rem`, `--color-ink-muted`, centered, `max-width: 480px`. Content: `From first draft to final export — every tool is here, in one place, without the clutter.`

**Feature cards grid (Bento Box):** Maintain an asymmetrical "Bento Box" grid (mixing horizontal wide cards with smaller square cards) rather than a boring uniform 3x2 grid. Configure grid spans to create this varied, premium layout. `gap: 24px`.

Each card: `background: var(--color-surface)`, `border-radius: 12px`, `padding: 32px`, `border: 1px solid var(--color-border)`. On hover: `background: #fff` (pure white, creates a subtle lift), card elevated shadow, `transform: translateY(-2px)`, transition `200ms ease`.

**6 Feature Cards (in order):**

1. **Live preview as you type**
   - Icon: A simple outlined rectangle with a cursor inside (SVG, `24px`, `stroke: var(--color-primary)`, `stroke-width: 1.5`, `fill: none`)
   - Description: `See your resume update in real time as you fill in each section — no save button, no refresh, no surprises.`

2. **Section-by-section AI feedback**
   - Icon: A simple outlined document with a small checkmark overlay
   - Description: `Get precise, line-level critique on your summary, experience bullets, and skills — not a generic score, but specific suggestions you can act on immediately.`

3. **ATS compatibility analysis**
   - Icon: A simple outlined gauge / dial
   - Description: `Know exactly where your resume stands against applicant tracking systems before you submit — with the specific issues highlighted in context.`

4. **Keyword gap analysis**
   - Icon: A simple outlined magnifying glass
   - Description: `Paste a job description and see which keywords are missing from your resume, ranked by how much they matter for that specific role.`

5. **Three professional templates**
   - Icon: A simple outlined grid of 3 rectangles (cards)
   - Description: `Switch between templates without losing a word of your content. Every template is ATS-safe — clean text, correct reading order, no columns that break parsers.`

6. **Export as PDF**
   - Icon: A simple outlined arrow pointing down into a tray
   - Description: `Download a pixel-precise PDF that looks exactly like the preview — real, selectable text that ATS systems can read, not a flattened image.`

**Icon rules:** All icons are simple, 1.5px stroke, outlined, minimal. No filled/solid icons. No emoji. No third-party icon library needed — these 6 can be inlined SVGs. All icons use `var(--color-primary)` as stroke color.

---

## 9. How It Works Section

**Background:** `--color-surface`. **Section heading:** `Instrument Serif`, centered. Content: `Three steps to a stronger resume.`

**Layout & The "Career Journey" Map:** Transform the 3 steps into an interconnected pathway. Behind the step text, position a dashed SVG line (`stroke: var(--color-primary)`, `stroke-width: 2px`, `stroke-dasharray: 8 8`) that physically connects Step 1 to Step 2 to Step 3. 
- **Desktop responsive behavior:** The line should swoop horizontally (e.g., dipping down from 1, swooping up to 2, dipping back to 3).
- **Mobile responsive behavior:** As the steps stack vertically, the SVG should swap to a vertically weaving line (snaking left to right behind the steps).
**No numbered circles with filled backgrounds** — just the numeral itself in `Instrument Serif`, large (`2.5rem`), `--color-primary`, above the step heading.

| Step | Heading | Description |
|---|---|---|
| 1 | Fill in your details | Work through each section at your own pace. The editor saves every keystroke — nothing is lost. |
| 2 | Analyze and refine | Run the ATS check and get specific feedback on what to improve, right where the issue is. |
| 3 | Export and apply | Download a clean PDF or share directly. Your resume is ready for any applicant tracking system. |

Each step has: numeral, bold heading (`Inter` 600, `1.125rem`, `--color-ink`), description text (`Inter` 400, `0.9375rem`, `--color-ink-muted`).

---

## 10. Template Showcase Section

**Background:** `--color-base`. **Section heading:** `Instrument Serif`, centered. Content: `Built to pass the machines. Designed to impress the humans.`

**Subhead:** `Three templates that look polished and parse perfectly.`

**Layout:** A horizontally scrollable row of 3 template preview cards (on desktop, all 3 visible side by side; on mobile, horizontal scroll-snap). Each card: `width: 320px`, `border-radius: 12px`, `border: 1px solid var(--color-border)`, card resting shadow, `overflow: hidden`.

Each card contains:
- A scaled-down (`transform: scale(0.55); transform-origin: top center;`) static render of the actual resume template (Classic, Modern, Minimal — the 3 templates from the builder)
- Below the preview: a thin strip with the template name (`Inter` 600, `0.9375rem`, `--color-ink`) and an ATS badge — a small pill `background: var(--color-surface)`, `color: var(--color-primary)`, text `ATS Safe ✓`, `font-size: 0.75rem`

**Below the row:** A single centered line: `Inter` 400, `0.875rem`, `--color-ink-muted`: `All templates export as real text PDFs — no images, no tables, no columns that confuse applicant tracking systems.`

---

## 11. ATS Feature Deep-Dive Section

**Background:** `--color-surface`. **Layout:** Two-column (`1fr 1fr`) on desktop, stacked on mobile. `gap: 64px`. Left is copy, right is a styled UI mockup of the ATS score panel.

**Left column — Copy:**
- Eyebrow (same pill style as hero): `ATS ANALYSIS`
- H2: `Know exactly why you're being filtered out.`
- Body: `Applicant tracking systems reject most resumes before a human ever reads them. Our ATS analyzer shows you the exact issues — not a generic score, but the specific lines and sections that need attention, with suggested rewrites you can apply in one click.`
- Two feature bullets (no bullet icons — just a `→` glyph in `--color-primary` followed by text):
  - `→ Highlights the exact sentence or bullet with an issue`
  - `→ Compares your skills against any job description you paste`
- CTA: `Check your ATS score` — primary button, same styling as hero.

**Right column — UI Mockup:**
- A styled card (`background: #fff`, `border-radius: 16px`, card elevated shadow, `border: 1px solid var(--color-border)`, `padding: 28px`) that visually represents the right-panel analysis view of the builder. Retain the small, hand-drawn SVG "editor's sketch" marks (like a small circled error and arrow) hovering over this mockup to enhance the precision-instrument feel.
- Inside: An ATS score display — the number (`87`) in `Instrument Serif`, large, `--color-primary`. Label below: `ATS Compatibility Score`. A thin `--color-border` divider. Below: 3–4 sample critique items, each as a small row — a section name chip (`Inter` 500, `0.75rem`, `background: var(--color-surface)`, `border-radius: 6px`, `padding: 4px 10px`) + a one-line issue description + a suggested rewrite in `--color-ink-muted`. This is a static visual mockup, not interactive.

---

## 12. Final CTA Section

**Background:** `--color-ink` (Deep Forest — the only section with a dark background, creating maximum contrast at page end).

**All text on this section is `#FCFFFD` (Porcelain), not pure white.**

**Layout:** Centered single-column, `max-width: 640px`.

**Content:**
- H2 (`Instrument Serif`, 400, `clamp(2rem, 3.5vw, 3rem)`, `#FCFFFD`): `Your next role starts with a better resume.`
- Body (`Inter` 400, `1.0625rem`, `rgba(252, 255, 253, 0.72)`): `No account required. Build, analyze, and export in under five minutes.`
- Two buttons (same structure as hero CTA row):
  - Primary: `Build your resume →` — `background: var(--color-primary)`, same sizing.
  - Secondary ghost: `border: 1.5px solid rgba(252,255,253,0.25)`, `color: #FCFFFD`. On hover: `border-color: var(--color-primary)`, `color: var(--color-primary)`.

---

## 13. Footer

**Background:** `--color-ink`. Same dark background as the CTA section — they blend as one block visually.

**Thin divider between CTA and footer:** `1px solid rgba(252,255,253,0.10)`.

**Layout:** Two rows.

**Row 1 (top):** Two columns — left: `[AppName]` wordmark + one-line description (`Inter` 400, `0.875rem`, `rgba(252,255,253,0.50)`: `Resume builder and ATS analyzer.`). Right: Three columns of footer links (Features, Templates, How it works).

**Footer links:** `Inter` 400, `0.875rem`, `rgba(252,255,253,0.55)`. On hover: `rgba(252,255,253,0.90)`, transition `150ms`.

**Row 2 (bottom):** `border-top: 1px solid rgba(252,255,253,0.10)`, `margin-top: 48px`, `padding-top: 24px`. One line: `© 2026 [AppName]. Built for job seekers.` — centered, `Inter` 400, `0.8125rem`, `rgba(252,255,253,0.35)`.

---

## 14. Micro-Animations & Interactions

**Scroll animations:** On scroll into view, elements animate in with `opacity: 0 → 1` and `transform: translateY(16px) → translateY(0)`, duration `400ms`, easing `cubic-bezier(0.16, 1, 0.3, 1)`. Use `IntersectionObserver` with threshold `0.15`. **Do not animate every element** — only the section heading, the subhead, and the card grid as a group (cards stagger by `60ms` each). Everything else appears instantly.

**Button interactions:**
- All primary buttons: `transform: translateY(-1px)` on hover, `transform: translateY(0px) scale(0.98)` on active (mousedown), transition `150ms ease`.
- All ghost/outline buttons: `border-color` and `color` transitions `150ms ease`.

**Card hover:** `transform: translateY(-2px)` + shadow upgrade, `200ms ease`. Only on desktop (not on touch devices — use `@media (hover: hover)`).

**No:** parallax effects, continuous looping animations, floating elements, pulsing glows, typewriter effects, number count-up animations, infinite scrolling marquees. All of these feel like AI-tool product pages. This page is still.

---

## 15. Responsive Breakpoints

| Breakpoint | Width | Changes |
|---|---|---|
| Desktop | `≥ 1024px` | 3-column feature grid, side-by-side How It Works, 2-col ATS section, all template cards visible |
| Tablet | `768px–1023px` | 2-column feature grid, How It Works stacks, ATS section stacks, nav collapses to hamburger |
| Mobile | `< 768px` | 1-column everything, hero H1 size drops to `clamp(2.25rem, 8vw, 3rem)`, template cards horizontal scroll-snap |

---

## 16. Technical Implementation Requirements

- **Framework:** Next.js (App Router). Keep components as React Server Components wherever possible. Do not pass `onClick`, `onMouseOver`, or other interactive event handlers unless you declare `'use client'`.
- **Styling:** Tailwind CSS. All custom tokens (colors, font families) must be defined in `tailwind.config.ts` using the exact hex values from §2. Do not use hardcoded hex values in className strings. Use pure Tailwind CSS utilities for hover states (e.g., `hover:-translate-y-[1px]`) to avoid client-side rendering requirements on static buttons.
- **Fonts:** Load via `next/font/google` in `layout.tsx`, not via a `<link>` tag.
- **Images:** Use `next/image` for any actual images. The hero mockup and template previews can be styled HTML/CSS components if no image files are provided — do not use placeholder `<img>` tags pointing to missing files.
- **Accessibility:**
  - All interactive elements have visible focus rings (`outline: 2px solid var(--color-primary)`, `outline-offset: 3px`).
  - `aria-label` on the mobile menu toggle button.
  - `<main>`, `<nav>`, `<footer>`, and each major section has a semantic HTML landmark element.
  - Contrast ratios: all body text on its background must pass WCAG AA (4.5:1 minimum). The `--color-ink-muted` on `--color-base` combination must be verified — adjust to `#3D5553` if it fails.
- **Performance:** No heavy third-party libraries. No animation libraries (Framer Motion, GSAP) — all animations via CSS transitions + vanilla `IntersectionObserver`. No icon font libraries — inline SVGs only.
- **No placeholder content:** Every string on the page must be real, final copy as specified in this document. No "Lorem ipsum." No "Coming soon." No "Insert text here."

---

## 17. What This Page Must NOT Contain

This is as important as everything above. Reject any of the following without exception:

- ❌ Robot, brain, neural network, circuit board, or chip illustrations
- ❌ Floating orb or blob animations
- ❌ Purple, indigo, blue, or pink color additions
- ❌ Gradient text (colored gradient applied to headline text via `background-clip: text`)
- ❌ "Powered by AI" badges, labels, or callouts
- ❌ Chatbot UI elements or conversation bubble illustrations
- ❌ Testimonials with fake avatars or placeholder names
- ❌ Pricing section (not relevant for this assessment)
- ❌ Cookie consent banners
- ❌ Newsletter signup form
- ❌ Generic stock-photo hero images (people at laptops, diverse team photos, etc.)
- ❌ Spinning loaders or skeleton screens on the landing page itself
- ❌ Auto-playing carousels or sliders
- ❌ Sticky floating chat widgets
- ❌ Progress bars, streaks, gamification elements
- ❌ Dark/light mode toggle (this page is light-mode only; the builder app may have its own scheme, but the landing page is always light)

---

*End of prompt. Deliver the complete Next.js page code (TypeScript), Tailwind config additions, and any required inline SVGs. The output should be a working, self-contained landing page that requires zero additional design decisions.*
