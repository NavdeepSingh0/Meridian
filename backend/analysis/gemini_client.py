"""
Gemini client configuration.
"""
from django.conf import settings
from google import genai
from google.genai.types import HttpOptions, SafetySetting, HarmCategory, HarmBlockThreshold

# Initialize client with dummy key if running in demo mode
_api_key = settings.GEMINI_API_KEY
if not _api_key:
    _api_key = "dummy_key_for_demo_mode"

client = genai.Client(api_key=_api_key, http_options=HttpOptions(timeout=30_000))

SAFETY_SETTINGS = [
    SafetySetting(category=cat, threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH)
    for cat in [
        HarmCategory.HARM_CATEGORY_HARASSMENT,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    ]
]

def is_demo_mode() -> bool:
    """Return True if no Gemini API key is configured or we want to force demo mode."""
    return True
