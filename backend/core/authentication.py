import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework import exceptions

User = get_user_model()

import os
import json

# Initialize Firebase Admin App
if not firebase_admin._apps:
    cred_json = os.environ.get("FIREBASE_CREDENTIALS")
    if cred_json:
        try:
            cert = json.loads(cred_json)
            cred = credentials.Certificate(cert)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized from FIREBASE_CREDENTIALS env var.")
        except Exception as e:
            # Raise so the deployment fails loudly instead of silently serving broken auth
            raise RuntimeError(f"Failed to initialize Firebase Admin SDK from FIREBASE_CREDENTIALS: {e}") from e
    else:
        # Fallback to local JSON file for development
        try:
            cred = credentials.Certificate("firebase-credentials.json")
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized from firebase-credentials.json file.")
        except Exception as e:
            raise RuntimeError(
                "Firebase Admin SDK could not be initialized. "
                "Set the FIREBASE_CREDENTIALS environment variable in production, "
                f"or ensure firebase-credentials.json exists locally. Error: {e}"
            ) from e

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Django Rest Framework that verifies
    JWTs issued by Firebase Auth.
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
            # Add clock_skew_seconds to handle local clock drift
            decoded_token = auth.verify_id_token(token, clock_skew_seconds=300)
        except auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed('The authentication token has expired.')
        except auth.InvalidIdTokenError as e:
            print(f"InvalidIdTokenError details: {e}")
            raise exceptions.AuthenticationFailed(f'Invalid authentication token: {str(e)}')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Error validating token: {str(e)}')

        # Extract the user's UID and email from the Firebase token
        uid = decoded_token.get('uid')
        email = decoded_token.get('email', '')

        if not uid:
            raise exceptions.AuthenticationFailed('Token contains no user identifier.')

        # Get or create the Django User based on the Firebase UID (which we map to the username)
        user, created = User.objects.get_or_create(
            username=uid,
            defaults={
                'email': email,
            }
        )

        return (user, token)
