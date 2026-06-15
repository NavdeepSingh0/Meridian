from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Extra installed apps for development only
# INSTALLED_APPS += [  # noqa: F405
# ]

# Use SQLite for local development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

# Allow CORS from the Next.js dev server
CORS_ALLOW_ALL_ORIGINS = True
