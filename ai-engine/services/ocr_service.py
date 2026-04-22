"""
BhashaFlow AI Engine — OCR Service

Uses EasyOCR to extract text from images containing Indian language text.
The reader is lazily initialized on first call to avoid slow startup.
"""

import io
import logging
from typing import Optional

import easyocr
import numpy as np
from PIL import Image

from .config import DEFAULT_OCR_LANGUAGES

logger = logging.getLogger(__name__)

# ── Module-level reader (lazy init) ──────────────────────────────
_reader: Optional[easyocr.Reader] = None
_loaded_languages: list[str] = []


def _get_reader(languages: list[str]) -> easyocr.Reader:
    """
    Return a cached EasyOCR reader, reinitializing only if the
    requested language set has changed.
    """
    global _reader, _loaded_languages

    if _reader is None or set(languages) != set(_loaded_languages):
        logger.info("Initializing EasyOCR reader with languages: %s", languages)
        _reader = easyocr.Reader(languages, gpu=False)
        _loaded_languages = list(languages)
        logger.info("EasyOCR reader ready.")

    return _reader


def extract_text_from_image(image_bytes: bytes, languages: Optional[list[str]] = None) -> dict:
    if languages is None:
        languages = DEFAULT_OCR_LANGUAGES

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        # Attempt to load the identified languages; fallback on compatibility errors
        try:
            reader = _get_reader(languages)
        except ValueError:
            logger.warning(f"Compatibility error with {languages}. Falling back to ['en', 'hi'].")
            reader = _get_reader(["en", "hi"])

        results = reader.readtext(image_np)
        details = []
        text_parts = []

        for bbox, text, confidence in results:
            details.append({
                "text": text,
                "confidence": round(float(confidence), 4),
                "bbox": [[int(coord) for coord in point] for point in bbox],
            })
            text_parts.append(text)

        return {
            "extracted_text": " ".join(text_parts).strip(),
            "details": details,
        }
    except Exception as e:
        logger.exception("OCR extraction failed")
        raise RuntimeError(f"OCR extraction failed: {e}") from e