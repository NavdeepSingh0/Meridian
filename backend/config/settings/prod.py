from .base import *  # noqa: F401, F403

# Placeholder — production settings to be completed before deployment.
DEBUG = True

# Static files handling in production
STATIC_ROOT = BASE_DIR / "staticfiles"

# Add Whitenoise to middleware right after SecurityMiddleware to serve static files
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
# If no CORS_ALLOWED_ORIGINS is set, fall back to allow all (safe for our use case where frontend auth is Firebase)
if not CORS_ALLOWED_ORIGINS:
    CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["http://localhost:3000"])

# Use the same env var as base.py so the Render "DJANGO_ALLOWED_HOSTS" setting is respected.
# base.py already sets ALLOWED_HOSTS from DJANGO_ALLOWED_HOSTS — don't override it here.
# We just ensure a safe fallback that includes the Render wildcard.
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["*"])

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
