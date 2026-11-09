"""
ViewSet for Resume CRUD operations.

Every resume belongs to the authenticated (Firebase) user; users can only
see and modify their own.
"""
from rest_framework.viewsets import ModelViewSet

from resumes.models import Resume
from resumes.serializers import ResumeSerializer


class ResumeViewSet(ModelViewSet):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer: ResumeSerializer) -> None:
        serializer.save(user=self.request.user)
