import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework import exceptions

User = get_user_model()

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Django Rest Framework that verifies
    JWTs issued by Supabase Auth.
    """
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None

        auth_parts = auth_header.split()
        if len(auth_parts) != 2 or auth_parts[0] != self.keyword:
            return None

        token = auth_parts[1]

        try:
            # Supabase issues tokens using HS256 algorithm with the project's JWT secret
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('The authentication token has expired.')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid authentication token.')

        # Extract the user's UUID and email from the Supabase JWT
        user_id = payload.get('sub')
        email = payload.get('email')

        if not user_id:
            raise exceptions.AuthenticationFailed('Token contains no user identifier.')

        # Get or create the Django User based on the Supabase UUID (which we map to the username)
        # We also store the email if it's available
        user, created = User.objects.get_or_create(
            username=user_id,
            defaults={
                'email': email or '',
            }
        )

        return (user, token)
