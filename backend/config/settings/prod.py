from .base import *  # noqa: F401, F403

# Placeholder — production settings to be completed before deployment.
DEBUG = False

# Static files handling in production
STATIC_ROOT = BASE_DIR / "staticfiles"

# Add Whitenoise to middleware right after SecurityMiddleware to serve static files
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
