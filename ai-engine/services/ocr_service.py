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


def extract_text_from_image(
    image_bytes: bytes,
    languages: Optional[list[str]] = None,
) -> dict:
    """
    Extract text from an image using EasyOCR.

    Args:
        image_bytes: Raw bytes of the uploaded image file.
        languages:   List of EasyOCR language codes (e.g. ['hi', 'en']).
                     Defaults to DEFAULT_OCR_LANGUAGES from config.

    Returns:
        {
            "extracted_text": "full concatenated text",
            "details": [
                {"text": "...", "confidence": 0.95, "bbox": [[x1,y1], ...]},
                ...
            ]
        }
    """
    if languages is None:
        languages = DEFAULT_OCR_LANGUAGES

    try:
        # Convert bytes → numpy array for EasyOCR
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        reader = _get_reader(languages)
        results = reader.readtext(image_np)

        # results = list of (bbox, text, confidence)
        details = []
        text_parts = []

        for bbox, text, confidence in results:
            # Convert numpy values to plain Python types for JSON serialization
            details.append({
                "text": text,
                "confidence": round(float(confidence), 4),
                "bbox": [[int(coord) for coord in point] for point in bbox],
            })
            text_parts.append(text)

        extracted_text = " ".join(text_parts).strip()

        return {
            "extracted_text": extracted_text,
            "details": details,
        }

    except Exception as e:
        logger.exception("OCR extraction failed")
        raise RuntimeError(f"OCR extraction failed: {e}") from e
