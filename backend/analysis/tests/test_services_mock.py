import pytest
from analysis import services
from resumes.schema import get_empty_resume_document

def test_generate_critique_mock():
    resume_data = get_empty_resume_document()
    result = services.generate_critique(resume_data)
    assert result.overall_score >= 0 and result.overall_score <= 100
    assert len(result.sections) > 0
    assert isinstance(result.overall_feedback, str)

def test_compute_ats_score_mock_no_jd():
    resume_data = get_empty_resume_document()
    result = services.compute_ats_score(resume_data)
    assert result.overall_score >= 0 and result.overall_score <= 100
    assert result.has_job_description is False
    assert len(result.missing_keywords) == 0

def test_compute_ats_score_mock_with_jd():
    resume_data = get_empty_resume_document()
    result = services.compute_ats_score(resume_data, job_description="Software Engineer with React")
    assert result.overall_score >= 0 and result.overall_score <= 100
    assert result.has_job_description is True
    assert len(result.missing_keywords) > 0
