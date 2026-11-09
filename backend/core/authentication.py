import json
import logging
import os

import firebase_admin
from django.contrib.auth import get_user_model
from firebase_admin import auth, credentials
from rest_framework import authentication, exceptions

logger = logging.getLogger(__name__)

User = get_user_model()


def init_firebase() -> None:
    """
    Initialise the Firebase Admin SDK once, on first use.

    Done lazily (not at import time) so that management commands, tests and
    tooling can import this module without credentials being present. If
    credentials are missing, the first authenticated request fails loudly.
    """
    if firebase_admin._apps:
        return

    cred_json = os.environ.get("FIREBASE_CREDENTIALS")
    try:
        if cred_json:
            cred = credentials.Certificate(json.loads(cred_json))
            source = "FIREBASE_CREDENTIALS env var"
        else:
            cred = credentials.Certificate("firebase-credentials.json")
            source = "firebase-credentials.json"
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialised from %s.", source)
    except Exception as e:
        raise RuntimeError(
            "Firebase Admin SDK could not be initialised. Set FIREBASE_CREDENTIALS in "
            "production, or provide firebase-credentials.json locally."
        ) from e


class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    DRF authentication class that verifies JWTs issued by Firebase Auth.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        init_firebase()

        try:
            decoded = auth.verify_id_token(parts[1], clock_skew_seconds=10)
        except auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed("Your session has expired. Please sign in again.")
        except auth.RevokedIdTokenError:
            raise exceptions.AuthenticationFailed("Your session was revoked. Please sign in again.")
        except Exception as e:
            # Log the detail server-side; never echo verifier internals to the client.
            logger.warning("Firebase token rejected (%s): %s", type(e).__name__, e)
            raise exceptions.AuthenticationFailed("Invalid authentication token.")

        uid = decoded.get("uid")
        if not uid:
            raise exceptions.AuthenticationFailed("Token contains no user identifier.")

        user, _ = User.objects.get_or_create(
            username=uid,
            defaults={"email": decoded.get("email", "")},
        )
        return (user, parts[1])

    def authenticate_header(self, request):
        # Makes DRF return 401 (not 403) for missing/invalid credentials.
        return self.keyword
