"""
BhashaFlow AI Engine — Translation Service

Uses the Sarvam AI Translate API (mayura:v1) to translate text
between Indian languages (22+ supported) and English.
"""

import logging

import requests

from .config import (
    SARVAM_API_KEY,
    SARVAM_HEADERS,
    SARVAM_TRANSLATE_URL,
    LANG_CODES,
    LANG_NAMES,
    BCP47_TO_SHORT,
    REQUEST_TIMEOUT,
)

logger = logging.getLogger(__name__)


def _resolve_lang_code(code: str) -> str:
    """
    Accept either a short code ('hi') or BCP-47 code ('hi-IN')
    and always return the BCP-47 form.
    """
    if code in LANG_CODES:
        return LANG_CODES[code]
    return code  # already BCP-47 or 'auto'


def translate_text(
    text: str,
    source_language_code: str = "auto",
    target_language_code: str = "en-IN",
) -> dict:
    """
    Translate text using Sarvam AI.

    Args:
        text:                  The text to translate (max 1000 chars for mayura:v1).
        source_language_code:  Source language ('auto', 'hi', 'hi-IN', etc.).
        target_language_code:  Target language ('en', 'en-IN', etc.).

    Returns:
        {
            "translated_text": "...",
            "source_language_code": "hi-IN",   # detected or echoed
        }

    Raises:
        RuntimeError: on any API / network error.
    """
    target_bcp47 = _resolve_lang_code(target_language_code)
    source_bcp47 = _resolve_lang_code(source_language_code)

    payload = {
        "input": text,
        "source_language_code": source_bcp47,
        "target_language_code": target_bcp47,
        "speaker_gender": "Male",
        "mode": "formal",
        "model": "mayura:v1",
        "enable_preprocessing": True,
    }

    logger.info(
        "Translating %d chars  %s → %s",
        len(text), source_bcp47, target_bcp47,
    )

    try:
        resp = requests.post(
            SARVAM_TRANSLATE_URL,
            headers=SARVAM_HEADERS,
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()

        return {
            "translated_text": data.get("translated_text", ""),
            "source_language_code": data.get("source_language_code", source_bcp47),
        }

    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            "Could not connect to the Sarvam translation service. Check your internet."
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("Translation request timed out.")
    except requests.exceptions.HTTPError:
        raise RuntimeError(
            f"Sarvam Translate API error (HTTP {resp.status_code}): {resp.text}"
        )
    except Exception as e:
        raise RuntimeError(f"Translation failed: {e}") from e


def get_language_name(code: str) -> str:
    """Return a human-readable name for a language code."""
    short = BCP47_TO_SHORT.get(code, code)
    return LANG_NAMES.get(short, code)
