"""
ViewSet for Resume CRUD operations.

Session-scoped: each browser only sees its own resumes (§12.2).
Session key is auto-assigned on create — the frontend never supplies it.

Note: these CRUD endpoints are NOT on the critical path (localStorage handles v1
persistence). They exist as the foundation for the DB-persistence stretch goal.
"""
from rest_framework.viewsets import ModelViewSet

from resumes.models import Resume
from resumes.serializers import ResumeSerializer


class ResumeViewSet(ModelViewSet):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        """Filter resumes to the current session's resumes only."""
        session_key = self.request.session.session_key
        if not session_key:
            # No session yet → return nothing
            return Resume.objects.none()
        return Resume.objects.filter(session_key=session_key)

    def perform_create(self, serializer: ResumeSerializer) -> None:
        """Auto-assign the current session key on creation."""
        # Ensure a session key exists
        if not self.request.session.session_key:
            self.request.session.create()
        serializer.save(session_key=self.request.session.session_key)
