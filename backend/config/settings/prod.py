from .base import *  # noqa: F401, F403

# Placeholder — production settings to be completed before deployment.
DEBUG = False

# Static files handling in production
STATIC_ROOT = BASE_DIR / "staticfiles"

# Add Whitenoise to middleware right after SecurityMiddleware to serve static files
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:3000"])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["http://localhost:3000"])

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost"])

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
