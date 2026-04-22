"""
BhashaFlow AI Engine — Centralized Configuration

All API keys, URLs, language maps, and shared constants live here.
API key is loaded from the SARVAM_API_KEY environment variable.
"""

import os

# ═══════════════════════════════════════════════════════════════════
#  SARVAM AI CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

# ═══════════════════════════════════════════════════════════════════
#  GEMINI CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

SARVAM_HEADERS = {
    "api-subscription-key": SARVAM_API_KEY,
    "Content-Type": "application/json",
}

# Base URLs for Sarvam AI endpoints
SARVAM_TRANSLATE_URL = "https://api.sarvam.ai/translate"
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"

# Request timeout (seconds)
REQUEST_TIMEOUT = 30

# ═══════════════════════════════════════════════════════════════════
#  LANGUAGE MAPS
# ═══════════════════════════════════════════════════════════════════

# Short code → BCP-47 code (used by Sarvam API)
LANG_CODES = {
    "hi": "hi-IN",   "en": "en-IN",   "mr": "mr-IN",
    "ta": "ta-IN",   "te": "te-IN",   "kn": "kn-IN",
    "ml": "ml-IN",   "bn": "bn-IN",   "gu": "gu-IN",
    "pa": "pa-IN",   "or": "od-IN",   "as": "as-IN",
    "ur": "ur-IN",   "sd": "sd-IN",   "ne": "ne-IN",
    "si": "si-LK",   "sa": "sa-IN",   "kok": "kok-IN",
    "mni": "mni-IN", "brx": "brx-IN", "doi": "doi-IN",
    "ks": "ks-IN",
}

# Short code → Human-readable name
LANG_NAMES = {
    "hi": "Hindi",       "en": "English",    "mr": "Marathi",
    "ta": "Tamil",       "te": "Telugu",     "kn": "Kannada",
    "ml": "Malayalam",   "bn": "Bengali",    "gu": "Gujarati",
    "pa": "Punjabi",     "or": "Odia",       "as": "Assamese",
    "ur": "Urdu",        "sd": "Sindhi",     "ne": "Nepali",
    "si": "Sinhala",     "sa": "Sanskrit",   "kok": "Konkani",
    "mni": "Manipuri",   "brx": "Bodo",      "doi": "Dogri",
    "ks": "Kashmiri",
}

# BCP-47 code → Short code (reverse lookup)
BCP47_TO_SHORT = {v: k for k, v in LANG_CODES.items()}

# ═══════════════════════════════════════════════════════════════════
#  OCR CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# Default subset of languages for EasyOCR
# (more languages = more memory; keep this tight)
DEFAULT_OCR_LANGUAGES = ["en", "hi", "mr", "ta", "te", "kn", "bn"]

# ═══════════════════════════════════════════════════════════════════
#  TTS CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

DEFAULT_TTS_SPEAKER = "shubh"       # Male voice (bulbul:v3 default)
DEFAULT_TTS_PACE = 1.0
DEFAULT_TTS_MODEL = "bulbul:v3"

# Languages supported by TTS (bulbul:v3)
TTS_SUPPORTED_LANGS = [
    "hi-IN", "bn-IN", "kn-IN", "ml-IN", "mr-IN",
    "od-IN", "pa-IN", "ta-IN", "te-IN", "en-IN", "gu-IN",
]

# ═══════════════════════════════════════════════════════════════════
#  STT CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

DEFAULT_STT_MODEL = "saaras:v3"
DEFAULT_STT_MODE = "transcribe"     # transcribe | translate | verbatim
