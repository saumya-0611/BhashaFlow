"""
BhashaFlow AI Engine - Gemini Service

Improvements:
  - Native response schema (pydantic), so no JSON regex extraction is needed
  - Fast exponential backoff for temporary 429s
  - Immediate fallback for exhausted daily/free-tier quota
"""

import logging
import re
import time
from typing import Literal

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from .config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

if GEMINI_API_KEY:
    _client = genai.Client(api_key=GEMINI_API_KEY)
    logger.info("Gemini client initialized with model: %s", GEMINI_MODEL)
else:
    _client = None
    logger.warning("GEMINI_API_KEY not set - analysis will use fallback values.")


class GrievanceAnalysis(BaseModel):
    title: str = Field(description="8-word English title summarizing the issue")
    english_summary: str = Field(description="2-3 sentence English summary for admin dashboard")
    verification_sentence: str = Field(
        description="Short yes/no question in the citizen's language confirming the issue. Under 10 words."
    )
    category: Literal[
        "cybercrime", "telecom_fraud", "human_rights", "corruption", 
        "consumer_rights", "banking", "stock_market", "insurance", 
        "telecom", "railways", "airlines", "road_transport", 
        "real_estate", "sanitation", "food_safety", "medicines", 
        "health_schemes", "environment", "aadhaar", "passport", 
        "income_tax", "provident_fund", "pensions", "postal_services", 
        "rti", "electricity_water", "national_general", "state_general", "other"
    ]
    keywords: list[str] = Field(description="3 to 5 key terms from the complaint")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence between 0.70 and 0.99")


def _fallback(english_text: str) -> dict:
    return {
        "title": english_text[:60].strip(),
        "english_summary": english_text,
        "verification_sentence": "kya yeh sahi hai?",
        "category": "other",
        "keywords": [],
        "confidence_score": 0.5,
    }


def _is_gemini_quota_error(exc: Exception) -> bool:
    text = str(exc)
    status_code = getattr(exc, "status_code", None)
    return status_code == 429 or "429" in text or "RESOURCE_EXHAUSTED" in text


def _is_exhausted_quota(exc: Exception) -> bool:
    """
    Daily/free-tier quota exhaustion does not recover with short retries.
    Avoid making citizens wait through backoff when Gemini already says quota is gone.
    """
    text = str(exc).lower()
    exhausted_markers = (
        "generaterequestsperday",
        "limit: 0",
        "check your plan and billing",
    )
    return any(marker in text for marker in exhausted_markers)


def _retry_delay_seconds(exc: Exception) -> int | None:
    text = str(exc)
    match = re.search(r"retryDelay['\"]?\s*:\s*['\"]?(\d+(?:\.\d+)?)s", text)
    if match is None:
        match = re.search(r"retry in (\d+(?:\.\d+)?)s", text, flags=re.IGNORECASE)
    if match is None:
        return None
    return max(1, int(float(match.group(1))))


def identify_scripts_with_gemini(image_bytes: bytes) -> list[str]:
    """
    Use Gemini Vision to identify Indian scripts in an uploaded grievance image.
    """
    if _client is None:
        return ["en", "hi"]

    image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/png")
    prompt = """Analyze this image of a handwritten grievance or any file uploaded in context of grievance.
Look closely at all characters.
Identify EVERY script or language present (e.g., Hindi, Malayalam, English, Tamil).
Return ONLY a comma-separated list of ISO codes like: hi, ml, en, ta.
Be thorough - if you see mixed scripts, list them all."""

    try:
        response = _client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt, image_part],
        )
        return [code.strip().lower() for code in response.text.split(",")]
    except Exception as e:
        if _is_gemini_quota_error(e):
            logger.warning("Gemini script identification quota/rate limited - using default scripts.")
        else:
            logger.error("Script identification failed: %s", e)
        return ["en", "hi"]


def analyze_with_gemini_fix_ocr(raw_text: str, identified_langs: list[str]) -> str:
    """Dual validation: Gemini cleans noisy OCR text based on context."""
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
        if _is_gemini_quota_error(e):
            logger.warning("Gemini OCR cleanup quota/rate limited - using raw OCR text.")
        else:
            logger.error("OCR fix failed: %s", e)
        return raw_text


def analyze_with_gemini(english_text: str, detected_language: str) -> dict:
    """
    Send English grievance text to Gemini for structured analysis.
    """
    if _client is None:
        logger.warning("Gemini not available - using fallback.")
        return _fallback(english_text)

    prompt = f"""Analyze this citizen grievance submitted to an Indian government portal.
Original language: {detected_language}
Grievance (in English): "{english_text}"

Priority rules:
- critical: health hazard, structural collapse, no water 3+ days, medical emergency
- high: essential service disrupted 24+ hours
- medium: service degraded but partially functional
- low: minor inconvenience or maintenance request

Categories Guide:
- cybercrime: Online scam, hacking, phishing, financial cyber fraud
- telecom_fraud: Stolen mobile, proxy SIM, fake caller ID, telecom fraud
- human_rights: Police brutality, illegal detention, human rights violations
- corruption: Bribery demands, corrupt government officials (Lokpal)
- consumer_rights: Product quality issues, e-commerce disputes, misleading ads
- banking: Bank branch issues, ATM failures, RBI complaints
- stock_market: Trading issues, SEBI rules, mutual funds
- insurance: Denied claims, fake policies, IRDAI
- telecom: Network outage, broadbrand issues, DTH complaints (TRAI)
- railways: Train delays, station cleanliness, IRCTC issues
- airlines: Flight delays, lost baggage, airline complaints
- road_transport: RTO, driving license, bus services, Parivahan
- real_estate: Property disputes, builder delays, RERA
- sanitation: Garbage dumping, street cleaning, local municipal issues
- food_safety: Adulterated food, restaurant hygiene (FSSAI)
- medicines: Fake drugs, pharmacy complaints (CDSCO)
- health_schemes: Ayushman Bharat, govt hospital issues
- environment: Pollution, noise, illegal logging, CPCB
- aadhaar: UIDAI update issues, fingerprint mismatch
- passport: Passport delays, police verification issues
- income_tax: ITR refunds, PAN card issues
- provident_fund: PF withdrawal delays, UAN issues (EPFO)
- pensions: Pension stoppages, life certificate issues
- postal_services: Missing parcels, India Post delays
- rti: Right to Information appeals
- electricity_water: Power cuts, high bills, lack of water supply
- national_general: Central government policies, PMO, generic national
- state_general: State CM issues, generic district administration
- other: Any uncategorized issue

For verification_sentence: write a short yes/no question in {detected_language} confirming the issue type.
Example for hi-IN: 'kya yeh paani ki samasya hai?'"""

    max_retries = 4
    base_delay = 2

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

            parsed: GrievanceAnalysis = response.parsed
            if parsed is None:
                logger.warning("Gemini returned no parsed object - using fallback.")
                return _fallback(english_text)

            logger.info(
                "Gemini done: category=%s, confidence=%.2f",
                parsed.category,
                parsed.confidence_score,
            )

            return {
                "title": parsed.title,
                "english_summary": parsed.english_summary,
                "verification_sentence": parsed.verification_sentence,
                "category": parsed.category,
                "keywords": parsed.keywords,
                "confidence_score": parsed.confidence_score,
            }

        except Exception as e:
            if _is_gemini_quota_error(e):
                if _is_exhausted_quota(e):
                    logger.warning(
                        "Gemini quota exhausted for model %s - using fallback without retry.",
                        GEMINI_MODEL,
                    )
                    return _fallback(english_text)

                if attempt < max_retries - 1:
                    retry_delay = _retry_delay_seconds(e)
                    wait = retry_delay if retry_delay is not None else base_delay * (2 ** attempt)
                    logger.warning(
                        "Gemini 429 - retrying in %ds (attempt %d/%d)",
                        wait,
                        attempt + 1,
                        max_retries,
                    )
                    time.sleep(wait)
                    continue

                logger.warning("Gemini 429 persisted after %d attempts - using fallback.", max_retries)
                return _fallback(english_text)

            logger.exception("Gemini API call failed: %s - using fallback.", e)
            return _fallback(english_text)

    logger.error("Gemini failed after %d attempts - using fallback.", max_retries)
    return _fallback(english_text)
