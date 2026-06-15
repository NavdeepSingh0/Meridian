"""
Pydantic schemas for structured AI output.

These schemas define the exact JSON shape expected from the Gemini model
for the Critique (M3) and ATS Score (M4) features. They must remain flat
(max one level of list-of-objects nesting) per §8.5 to avoid SDK issues.
"""
from pydantic import BaseModel, Field


# --- M3: AI Critique ---

class SectionCritique(BaseModel):
    # section should conceptually be one of: "basics", "work", "education", "projects", "skills", "certificates"
    section: str = Field(description="Resume section name, e.g. 'summary', 'work', 'skills'")
    score: int = Field(ge=0, le=100, description="Section quality score, 0-100")
    strengths: list[str] = Field(description="What works well in this section")
    improvements: list[str] = Field(description="Specific, actionable suggestions")


class CritiqueResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    overall_feedback: str = Field(description="2-4 sentence high-level summary")
    sections: list[SectionCritique]


# --- M4: ATS Score ---

class KeywordGap(BaseModel):
    keyword: str = Field(description="Skill or term present in the JD but missing from the resume")
    importance: str = Field(description="One of: High, Medium, Low")


class ATSResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    summary: str = Field(description="2-4 sentence summary of ATS compatibility")
    strengths: list[str]
    issues: list[str] = Field(description="Specific ATS problems found, e.g. 'No quantified achievements in Experience'")
    has_job_description: bool
    # Empty list if has_job_description is false
    missing_keywords: list[KeywordGap] = Field(description="Empty list if has_job_description is false")
