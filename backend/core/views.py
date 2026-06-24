from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Profile

class UserProfileView(APIView):
    """
    GET /api/auth/profile/
    Returns the authenticated user's profile details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile, created = Profile.objects.get_or_create(user=request.user)
        
        return Response({
            "email": request.user.email,
            "ai_credits": profile.ai_credits,
            "is_premium": profile.is_premium,
            "is_admin": profile.is_admin,
        })
