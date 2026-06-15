# Redshot Labs — Full Stack Developer Technical Assessment

**Role:** Full Stack Developer  
**Company:** Redshot Labs  
**Duration:** 5 Days  
**Submission:** GitHub repo link + brief Loom walkthrough (optional)  
**Stack:** Next.js (Frontend) + Python / Django (Backend)  
**Total Points:** 100 Base + 40 Bonus  
**Pass Threshold:** 60 points

---

## Background

At Redshot Labs, we build real products that solve real problems. This assessment reflects the kind of work you will do from day one — not toy problems or LeetCode puzzles.

You will build an **AI-powered Resume Builder web application**. This project tests your ability to design clean UIs, wire up backend APIs, integrate AI, and ship a working product end-to-end.

We care about how you think, how you structure code, and how you handle ambiguity — not just whether everything works perfectly.

---

## The Task

Build a Resume Builder web application with the following core features. Work through the milestones in order — each builds on the last.

---

## Milestones & Scoring

| Milestone | Base Points | Bonus Points | Description |
|---|---|---|---|
| M1 — Resume Editor | 20 pts | — | User can create and edit a resume with sections: Name, Summary, Experience, Education, Skills |
| M2 — Template Switcher | 20 pts | +5 pts | At least 2 visual templates. Bonus: 3+ templates with live preview |
| M3 — AI Critique | 25 pts | +10 pts | Integrate an LLM to give feedback on the resume content. Bonus: section-by-section critique with suggestions |
| M4 — ATS Score | 20 pts | +10 pts | Analyse and display an ATS compatibility score with reasons. Bonus: keyword gap analysis with a job description input |
| M5 — Export / Save | 15 pts | +15 pts | Save resume state (localStorage or DB). Bonus: export as PDF |

**Threshold:** 60 / 100 to pass | **Max Base:** 100 pts | **Max with Bonus:** 140 pts

> You do not need to complete every milestone. Do what you can — quality over quantity.

---

## Technical Requirements

### Frontend (Next.js)
- Use Next.js (App Router preferred)
- Clean, functional UI — no need to be pixel-perfect
- Component-based architecture
- State management of your choice (useState, Zustand, Redux, etc.)

### Backend (Python / Django)
- Django REST Framework for API endpoints
- At least one API endpoint for AI critique / ATS scoring
- Basic error handling and response formatting

### AI Integration
- Use any LLM API — OpenAI, Anthropic, Gemini, or open-source
- If you don't have API credits, mock the response with realistic dummy data and note it in your README
- **Prompt engineering matters** — show us how you craft your prompts

---

## How We Will Evaluate

### What We Look For
- Code quality & structure
- Problem-solving approach
- AI integration thoughtfulness
- README clarity
- Milestones completed

### What We Ignore
- Perfect UI design
- 100% feature completion
- Which LLM you used
- Framework version
- Using AI to help you code

---

## Submission Instructions

1. Push your code to a **public GitHub repository**
2. Include a `README.md` with:
   - Setup instructions
   - Features completed
   - Milestones attempted
   - Any known issues
3. Optional but appreciated: a short Loom video (2–3 mins) walking through your app
4. Reply to the email with your GitHub link within **5 days**

---

## Questions

Reach out anytime at **emily@redshotlabs.com**
