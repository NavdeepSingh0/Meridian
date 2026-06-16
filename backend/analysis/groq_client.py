"""
Groq client configuration.
"""
from django.conf import settings
from groq import Groq

# Initialize client with dummy key if running in demo mode
_api_key = settings.GROQ_API_KEY
if not _api_key:
    _api_key = "dummy_key_for_demo_mode"

client = Groq(api_key=_api_key)

def is_demo_mode() -> bool:
    """Return True if no Groq API key is configured."""
    return not bool(settings.GROQ_API_KEY)
