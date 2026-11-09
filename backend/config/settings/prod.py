import logging

from .base import *  # noqa: F401, F403

DEBUG = False

# Static files handling in production
STATIC_ROOT = BASE_DIR / "staticfiles"

# Add Whitenoise to middleware right after SecurityMiddleware to serve static files
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

# base.py reads DJANGO_ALLOWED_HOSTS; in production default to Render's domain
# rather than a wildcard. Set DJANGO_ALLOWED_HOSTS for custom domains.
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[".onrender.com"])

# Auth is a Firebase Bearer token (no cookies), so CORS is a defence-in-depth
# layer. Set CORS_ALLOWED_ORIGINS to the deployed frontend origin(s).
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
if not CORS_ALLOWED_ORIGINS:
    logging.getLogger(__name__).warning(
        "CORS_ALLOWED_ORIGINS is not set - allowing all origins. Set it to your frontend URL."
    )
    CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["http://localhost:3000"])

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")  # behind Render's proxy
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
