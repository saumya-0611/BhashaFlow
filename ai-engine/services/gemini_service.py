"""
BhashaFlow AI Engine — Gemini Service

Improvements:
  - Native response schema (pydantic) — eliminates _extract_json / regex entirely
  - Fast exponential backoff for 429s (2s, 4s, 8s) — citizen-friendly latency
  - Simplified prompt — no redundant JSON/markdown instructions (locked by schema)
"""

import logging
import time
from typing import Literal

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from .config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

if GEMINI_API_KEY:
    _client = genai.Client(api_key=GEMINI_API_KEY)
    logger.info("✅ Gemini client initialized with model: %s", GEMINI_MODEL)
else:
    _client = None
    logger.warning("⚠️  GEMINI_API_KEY not set — analysis will use fallback values.")


# ── Response Schema ───────────────────────────────────────────────
# Gemini 3 enforces this schema natively — no regex, no JSONDecodeError

class GrievanceAnalysis(BaseModel):
    title: str = Field(description="8-word English title summarizing the issue")
    english_summary: str = Field(description="2-3 sentence English summary for admin dashboard")
    verification_sentence: str = Field(description="Short yes/no question in the citizen's language confirming the issue. Under 10 words.")
    category: Literal["water", "roads", "electricity", "sanitation", "education", "healthcare", "other"]
    priority: Literal["low", "medium", "high", "critical"]
    keywords: list[str] = Field(description="3 to 5 key terms from the complaint")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence between 0.70 and 0.99")


# ── Fallback ──────────────────────────────────────────────────────

def _fallback(english_text: str) -> dict:
    return {
        "title":                 english_text[:60].strip(),
        "english_summary":       english_text,
        "verification_sentence": "kya yeh sahi hai?",
        "category":              "other",
        "priority":              "medium",
        "keywords":              [],
        "confidence_score":      0.5,
    }


# ── Main Function ─────────────────────────────────────────────────
# Add to services/gemini_service.py

def identify_scripts_with_gemini(image_bytes: bytes) -> list[str]:
    """
    Uses Gemini Flash to identify which Indian scripts are in the image.
    """
    if _client is None:
        return ["en", "hi"] # Safe default

    # Create a part from the image bytes
    image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/png")
    
    prompt = """Analyze this image of a handwritten grievance or any file uploaded in context of grievance. 
                Look closely at all characters. 
                Identify EVERY script or language present (e.g., Hindi, Malayalam, English, Tamil). 
                Return ONLY a comma-separated list of ISO codes like: hi, ml, en, ta.
                Be thorough—if you see mixed scripts, list them all."""

    try:
        response = _client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt, image_part]
        )
        # Extract codes like ['hi', 'ml']
        codes = [c.strip().lower() for c in response.text.split(",")]
        return codes
    except Exception as e:
        logger.error(f"Script identification failed: {e}")
        return ["en", "hi"]
    
def analyze_with_gemini_fix_ocr(raw_text: str, identified_langs: list[str]) -> str:
    """Dual Validation: Gemini cleans and reconstructs noisy OCR text based on context."""
    if _client is None or not raw_text.strip():
        return raw_text

    prompt = f"""The following text was extracted via OCR from a citizen grievance in {identified_langs}. 
    It may contain misread characters or noise. Reconstruct it into a coherent, meaningful grievance 
    in its original language. Correct obvious errors but keep the original intent.
    
    RAW OCR TEXT:
    "{raw_text}"
    
    Return ONLY the corrected text."""

    try:
        response = _client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"OCR fix failed: {e}")
        return raw_text
    
def analyze_with_gemini(english_text: str, detected_language: str) -> dict:
    """
    Send English grievance text to Gemini for structured analysis.

    Returns:
        {
            title, english_summary, verification_sentence,
            category, priority, keywords, confidence_score
        }
    """
    if _client is None:
        logger.warning("Gemini not available — using fallback.")
        return _fallback(english_text)

    # Prompt is clean — no JSON/markdown instructions needed (schema handles it)
    prompt = f"""Analyze this citizen grievance submitted to an Indian government portal.
Original language: {detected_language}
Grievance (in English): "{english_text}"

Priority rules:
- critical: health hazard, structural collapse, no water 3+ days, medical emergency
- high: essential service disrupted 24+ hours
- medium: service degraded but partially functional
- low: minor inconvenience or maintenance request

For verification_sentence: write a short yes/no question in {detected_language} confirming the issue type.
Example for hi-IN: 'kya yeh paani ki samasya hai?'"""

    # Fast exponential backoff: 2s → 4s → 8s
    # Flash 429s clear in seconds, not minutes — no citizen should wait 60s
    max_retries = 4
    base_delay  = 2

    for attempt in range(max_retries):
        try:
            response = _client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        "You are an AI assistant for BhashaFlow, an Indian government "
                        "citizen grievance portal. Analyze complaints and extract structured data."
                    ),
                    response_mime_type="application/json",
                    response_schema=GrievanceAnalysis,
                    temperature=0.2,
                ),
            )

            # With response_schema, response.parsed gives a typed Pydantic object directly
            parsed: GrievanceAnalysis = response.parsed
            if parsed is None:
                logger.warning("Gemini returned no parsed object — using fallback.")
                return _fallback(english_text)

            logger.info(
                "Gemini done: category=%s, priority=%s, confidence=%.2f",
                parsed.category, parsed.priority, parsed.confidence_score
            )

            return {
                "title":                 parsed.title,
                "english_summary":       parsed.english_summary,
                "verification_sentence": parsed.verification_sentence,
                "category":              parsed.category,
                "priority":              parsed.priority,
                "keywords":              parsed.keywords,
                "confidence_score":      parsed.confidence_score,
            }

        except Exception as e:
            is_429 = "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)

            if is_429 and attempt < max_retries - 1:
                wait = base_delay * (2 ** attempt)  # 2, 4, 8 seconds
                logger.warning(
                    "Gemini 429 — retrying in %ds (attempt %d/%d)",
                    wait, attempt + 1, max_retries
                )
                time.sleep(wait)
                continue

            logger.exception("Gemini API call failed: %s — using fallback.", e)
            return _fallback(english_text)

    logger.error("Gemini failed after %d attempts — using fallback.", max_retries)
    return _fallback(english_text)
