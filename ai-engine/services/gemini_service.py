"""
BhashaFlow AI Engine — Gemini Service

Uses Google Gemini 2.0 Flash to:
  - Extract category, priority, and keywords from English grievance text
  - Generate a human-readable English summary for admins
  - Generate a native-language verification sentence for the citizen
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

# ── Fallback response when Gemini is unavailable ──────────────────
def _fallback(english_text: str) -> dict:
    return {
        "title": english_text[:60].strip(),
        "english_summary": english_text,
        "verification_sentence": "kya yeh sahi hai?",
        "category": "other",
        "priority": "medium",
        "keywords": [],
        "confidence_score": 0.5,
    }


def analyze_with_gemini(english_text: str, detected_language: str) -> dict:
    """
    Send the English translation of a grievance to Gemini 2.0 Flash
    and receive structured analysis.

    Args:
        english_text:       English translation of the citizen's complaint.
        detected_language:  BCP-47 code of the original language (e.g. 'hi-IN').

    Returns:
        {
            "title":                 "8-word English title",
            "english_summary":       "2-3 sentence admin summary",
            "verification_sentence": "native-language Yes/No question for citizen",
            "category":              one of water/roads/electricity/sanitation/education/healthcare/other,
            "priority":              one of low/medium/high/critical,
            "keywords":              ["list", "of", "key", "terms"],
            "confidence_score":      0.0 to 1.0
        }
    """
    if _client is None:
        logger.warning("Gemini not available — using fallback.")
        return _fallback(english_text)

    prompt = f"""Analyze this citizen grievance (originally in {detected_language}):
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

For the confidence_score, assign a value between 0.70 and 0.99 reflecting how confidently
you identified the category. Return only the JSON object, nothing else."""

    try:
        response = _client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are an AI assistant for BhashaFlow, an Indian government citizen grievance portal. "
                    "You analyze citizen complaints and extract structured information. "
                    "Always respond with ONLY a valid JSON object. "
                    "No markdown, no code fences, no explanations outside the JSON."
                ),
                response_mime_type="application/json",
            ),
        )
        raw = response.text.strip()

        # Strip markdown code fences if Gemini wraps in ```json ... ```
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        raw = raw.strip()

        data = json.loads(raw)

        # Validate and sanitise required fields
        valid_categories = {"water", "roads", "electricity", "sanitation", "education", "healthcare", "other"}
        valid_priorities = {"low", "medium", "high", "critical"}

        return {
            "title": str(data.get("title", english_text[:60])).strip(),
            "english_summary": str(data.get("english_summary", english_text)).strip(),
            "verification_sentence": str(data.get("verification_sentence", "kya yeh sahi hai?")).strip(),
            "category": data.get("category", "other") if data.get("category") in valid_categories else "other",
            "priority": data.get("priority", "medium") if data.get("priority") in valid_priorities else "medium",
            "keywords": list(data.get("keywords", [])),
            "confidence_score": float(data.get("confidence_score", 0.75)),
        }

    except (json.JSONDecodeError, KeyError, TypeError) as parse_err:
        logger.warning("Gemini response parse failed: %s — using fallback.", parse_err)
        return _fallback(english_text)

    except Exception as e:
        logger.exception("Gemini API call failed: %s — using fallback.", e)
        return _fallback(english_text)