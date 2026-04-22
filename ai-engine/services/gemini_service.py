"""
BhashaFlow AI Engine — Gemini Service

FIX: google-genai >= 1.0 changed the client API.
  - genai.Client() is correct for >= 0.8 and the new SDK
  - response_mime_type="application/json" is supported in GenerateContentConfig
  - Added better error handling and JSON extraction
"""

import json
import logging
import re

from google import genai
from google.genai import types

from .config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

if GEMINI_API_KEY:
    _client = genai.Client(api_key=GEMINI_API_KEY)
    logger.info("✅ Gemini 2.0 Flash client initialized.")
else:
    _client = None
    logger.warning("⚠️  GEMINI_API_KEY not set — analysis will use fallback values.")


def _fallback(english_text: str) -> dict:
    return {
        "title":                english_text[:60].strip(),
        "english_summary":      english_text,
        "verification_sentence": "kya yeh sahi hai?",
        "category":             "other",
        "priority":             "medium",
        "keywords":             [],
        "confidence_score":     0.5,
    }


def _extract_json(raw: str) -> dict:
    """
    Robustly extract JSON from model output.
    Handles: plain JSON, ```json ... ```, stray text before/after braces.
    """
    # Strip markdown fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw).strip()

    # FIX: if model still added preamble text, find the first { … } block
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)

    return json.loads(raw)


def analyze_with_gemini(english_text: str, detected_language: str) -> dict:
    """
    Send English grievance text to Gemini 2.0 Flash for structured analysis.

    Returns:
        {
            "title":                  "8-word English title",
            "english_summary":        "2-3 sentence admin summary",
            "verification_sentence":  "native-language Yes/No question",
            "category":               water|roads|electricity|sanitation|education|healthcare|other,
            "priority":               low|medium|high|critical,
            "keywords":               ["key", "terms"],
            "confidence_score":       0.0 to 1.0
        }
    """
    if _client is None:
        logger.warning("Gemini not available — using fallback.")
        return _fallback(english_text)

    prompt = f"""Analyze this citizen grievance (originally in language: {detected_language}):
"{english_text}"

Return a JSON object with EXACTLY these fields:
{{
  "title": "8-word English title summarizing the issue",
  "english_summary": "2-3 sentence English summary for the admin dashboard",
  "verification_sentence": "One short question in {detected_language} confirming the issue type. Under 10 words. Example for hi-IN: 'kya yeh paani ki samasya hai?'",
  "category": "one of: water, roads, electricity, sanitation, education, healthcare, other",
  "priority": "one of: low, medium, high, critical",
  "keywords": ["3 to 5 key terms extracted from the complaint"],
  "confidence_score": 0.0
}}

Priority rules:
- critical: health hazard, structural collapse, no water for 3+ days, medical emergency
- high: essential services disrupted for 24+ hours
- medium: services degraded but partially functional
- low: minor inconvenience or maintenance request

For confidence_score assign a float between 0.70 and 0.99.
Return ONLY the JSON object. No markdown, no code fences, no extra text."""

    try:
        response = _client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are an AI assistant for BhashaFlow, an Indian government citizen grievance portal. "
                    "Analyze citizen complaints and extract structured information. "
                    "Always respond with ONLY a valid JSON object. "
                    "No markdown, no code fences, no explanations outside the JSON."
                ),
                # FIX: response_mime_type forces JSON output — reduces parse failures
                response_mime_type="application/json",
                temperature=0.2,  # low temperature for consistent structured output
            ),
        )

        raw = response.text.strip() if response.text else ""
        if not raw:
            logger.warning("Gemini returned empty response — using fallback.")
            return _fallback(english_text)

        data = _extract_json(raw)

        valid_categories = {"water", "roads", "electricity", "sanitation", "education", "healthcare", "other"}
        valid_priorities  = {"low", "medium", "high", "critical"}

        return {
            "title":                str(data.get("title", english_text[:60])).strip(),
            "english_summary":      str(data.get("english_summary", english_text)).strip(),
            "verification_sentence": str(data.get("verification_sentence", "kya yeh sahi hai?")).strip(),
            "category":             data.get("category", "other") if data.get("category") in valid_categories else "other",
            "priority":             data.get("priority", "medium") if data.get("priority") in valid_priorities else "medium",
            "keywords":             list(data.get("keywords", [])),
            "confidence_score":     float(data.get("confidence_score", 0.75)),
        }

    except (json.JSONDecodeError, KeyError, TypeError) as parse_err:
        logger.warning("Gemini response parse failed: %s — using fallback.", parse_err)
        return _fallback(english_text)

    except Exception as e:
        logger.exception("Gemini API call failed: %s — using fallback.", e)
        return _fallback(english_text)