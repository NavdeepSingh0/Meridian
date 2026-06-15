import os
import django

# Setup django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
try:
    django.setup()
except Exception:
    pass

from django.conf import settings
from analysis.services import generate_critique, compute_ats_score

def test_ai():
    print("Checking settings.GEMINI_API_KEY...")
    print(f"API KEY SET: {bool(settings.GEMINI_API_KEY)}")
    
    test_resume = {
        "basics": {
            "name": "Navdeep Singh",
            "label": "Software Engineer",
            "summary": "Experienced full-stack engineer specialized in Python, React, and Django.",
            "location": {"city": "San Francisco", "country": "US"}
        },
        "work": [
            {
                "company": "Tech Corp",
                "position": "Senior Engineer",
                "summary": "Built scalable cloud architectures using AWS and Kubernetes. Improved performance by 30%."
            }
        ],
        "skills": [
            {"name": "Languages", "keywords": ["Python", "JavaScript", "SQL"]},
            {"name": "Frameworks", "keywords": ["Django", "React", "Next.js"]}
        ]
    }
    
    test_jd = "Looking for a Software Engineer with experience in Python, Django, AWS, Kubernetes, and React."

    print("\nRunning generate_critique...")
    try:
        critique = generate_critique(test_resume)
        print("Critique Overall Score:", critique.overall_score)
        print("Critique Overall Feedback:", critique.overall_feedback)
        print("Critique Sections Count:", len(critique.sections))
    except Exception as e:
        print("Critique Failed:", e)

    print("\nRunning compute_ats_score with Job Description...")
    try:
        ats = compute_ats_score(test_resume, test_jd)
        print("ATS Overall Score:", ats.overall_score)
        print("ATS Summary:", ats.summary)
        print("ATS Strengths (Matching Keywords):", ats.strengths)
        print("ATS Missing Keywords:", [(k.keyword, k.importance) for k in ats.missing_keywords])
    except Exception as e:
        print("ATS Failed:", e)

if __name__ == "__main__":
    test_ai()
