"""
Mock data for the analysis service layer.

This provides perfectly-structured fallback data for "Demo Mode"
(no API key) and for fallback during 429 rate-limit errors or
validation failures, ensuring the frontend always receives a
working response payload.
"""
from analysis.schemas import CritiqueResult, SectionCritique, ATSResult, KeywordGap


def get_mock_critique() -> CritiqueResult:
    """Return a realistic mocked CritiqueResult."""
    return CritiqueResult(
        overall_score=78,
        overall_feedback=(
            "Your resume has a strong foundation, particularly in your technical skills and education. "
            "However, your experience section could be much stronger. You are currently describing your "
            "responsibilities rather than your achievements. Let's quantify your impact and use stronger action verbs."
        ),
        sections=[
            SectionCritique(
                section="work",
                score=65,
                strengths=[
                    "Clear career progression at relevant companies.",
                    "Good use of standard job titles."
                ],
                improvements=[
                    "Quantify your impact: Instead of 'Improved database performance', try 'Reduced database query latency by 40%'.",
                    "Use stronger action verbs: Replace 'Responsible for' with 'Led' or 'Architected'.",
                    "Focus on achievements rather than duties."
                ]
            ),
            SectionCritique(
                section="skills",
                score=90,
                strengths=[
                    "Comprehensive list of relevant modern technologies.",
                    "Well-categorized and easy to read."
                ],
                improvements=[
                    "Consider organizing your skills by proficiency (e.g., Expert vs Familiar) if applying for senior roles.",
                    "Ensure every skill listed here is actually demonstrated in your experience section."
                ]
            )
        ]
    )


def get_mock_ats_result(has_job_description: bool = False) -> ATSResult:
    """Return a realistic mocked ATSResult, optionally with keyword gaps."""
    missing = []
    if has_job_description:
        missing = [
            KeywordGap(keyword="React.js", importance="High"),
            KeywordGap(keyword="PostgreSQL", importance="Medium"),
            KeywordGap(keyword="CI/CD Pipelines", importance="High"),
            KeywordGap(keyword="Agile Methodologies", importance="Low"),
        ]

    return ATSResult(
        overall_score=72,
        summary=(
            "This resume is fairly ATS-friendly but has some structural issues that might prevent "
            "parsers from extracting your experience correctly. You are also missing several key terms "
            "from the job description that will lower your ranking."
            if has_job_description else
            "This resume is fairly ATS-friendly but has some structural issues that might prevent "
            "parsers from extracting your experience correctly. It adheres to standard fonts and layout "
            "but could improve its keyword density."
        ),
        strengths=[
            "Standard, readable fonts used.",
            "Contact information is complete and well-formatted.",
            "No tables or complex columns detected."
        ],
        issues=[
            "Missing quantifiable metrics in 3 out of 4 work experiences.",
            "Date formats are inconsistent (use MM/YYYY).",
            "Section headers are slightly unconventional; stick to 'Experience', 'Education', 'Skills'."
        ],
        has_job_description=has_job_description,
        missing_keywords=missing
    )

def get_mock_parsed_resume() -> dict:
    """
    Return a realistic mock parsed resume dict for demo mode PDF parsing.
    Matches the locked JSON Resume schema.
    """
    return {
        "basics": {
            "name": "Sarah Chen",
            "label": "Full-Stack Software Engineer",
            "email": "sarah.chen@example.com",
            "phone": "+1 (415) 555-0198",
            "url": "sarahchen.dev",
            "summary": (
                "Full-stack software engineer with 4 years of experience building "
                "high-traffic consumer products. Specializes in React/Next.js frontends "
                "and Python/Django backends."
            ),
            "location": {"city": "San Francisco", "region": "CA", "countryCode": "US"},
            "profiles": [
                {"network": "LinkedIn", "url": "linkedin.com/in/sarahchen"},
                {"network": "GitHub", "url": "github.com/sarahchen"},
            ],
        },
        "work": [
            {
                "name": "Acme Corp",
                "position": "Senior Software Engineer",
                "startDate": "03/2022",
                "endDate": "Present",
                "summary": "",
                "highlights": [
                    "Led re-architecture of checkout flow, reducing cart abandonment by 22%.",
                    "Built a real-time notifications system serving 500K+ daily active users.",
                ],
            }
        ],
        "education": [
            {
                "institution": "University of California, Berkeley",
                "area": "Computer Science",
                "studyType": "B.S.",
                "startDate": "08/2016",
                "endDate": "05/2020",
                "score": "3.7 GPA",
            }
        ],
        "projects": [],
        "skills": [
            {"name": "Languages", "level": "", "keywords": ["TypeScript", "Python", "SQL"]},
            {"name": "Frameworks", "level": "", "keywords": ["React", "Next.js", "Django"]},
        ],
        "certificates": [],
        "volunteer": [],
        "awards": [],
        "publications": [],
        "languages": [],
        "interests": [],
        "references": [],
    }
