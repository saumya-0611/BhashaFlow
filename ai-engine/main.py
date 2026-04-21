"""
BhashaFlow AI Engine — Main FastAPI Application

Endpoints:
    GET  /                  Health check
    GET  /languages         Supported languages list
    POST /ocr               Extract text from image
    POST /translate         Translate text between languages
    POST /speech-to-text    Transcribe audio to text
    POST /text-to-speech    Synthesize text to audio
    POST /speech-to-speech  Full voice pipeline (STT → Translate → TTS)
    POST /process-grievance Unified endpoint for the Node.js backend
"""

import logging
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.config import (
    SARVAM_API_KEY,
    GEMINI_API_KEY,
    LANG_CODES,
    LANG_NAMES,
    BCP47_TO_SHORT,
    DEFAULT_OCR_LANGUAGES,
    DEFAULT_TTS_SPEAKER,
    DEFAULT_TTS_PACE,
)
from services.ocr_service import extract_text_from_image
from services.translate_service import translate_text, get_language_name
from services.speech_service import (
    speech_to_text,
    text_to_speech,
    speech_to_speech,
)
from services.grievance_service import process_grievance_full

# ── Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── FastAPI App ──────────────────────────────────────────────────
app = FastAPI(
    title="BhashaFlow AI Engine",
    description="Multilingual grievance processing — OCR, Translation, and Speech services for Indian languages.",
    version="1.0.0",
)

# ── CORS (allow the frontend and backend to call us) ─────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════
#  STARTUP VALIDATION
# ═══════════════════════════════════════════════════════════════════

@app.on_event("startup")
def validate_config():
    if not SARVAM_API_KEY:
        logger.warning(
            "⚠️  SARVAM_API_KEY is not set! "
            "Translation, STT, and TTS endpoints will fail. "
            "Set the environment variable and restart."
        )
    else:
        logger.info("✅ SARVAM_API_KEY is configured.")

    if not GEMINI_API_KEY:
        logger.warning(
            "⚠️  GEMINI_API_KEY is not set! "
            "Grievance analysis will use fallback values (no AI categorisation)."
        )
    else:
        logger.info("✅ GEMINI_API_KEY is configured.")

    logger.info("🚀 BhashaFlow AI Engine is starting up...")


# ═══════════════════════════════════════════════════════════════════
#  PYDANTIC MODELS (request bodies for JSON endpoints)
# ═══════════════════════════════════════════════════════════════════

class TranslateRequest(BaseModel):
    text: str
    source_language_code: str = "auto"
    target_language_code: str = "en-IN"


class TTSRequest(BaseModel):
    text: str
    target_language_code: str = "hi-IN"
    speaker: str = DEFAULT_TTS_SPEAKER
    pace: float = DEFAULT_TTS_PACE


# ═══════════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════

@app.get("/")
def health_check():
    return {
        "status": "AI Engine is online",
        "version": "1.0.0",
        "services": ["ocr", "translate", "speech-to-text", "text-to-speech", "speech-to-speech", "gemini-analysis"],
        "api_key_configured": bool(SARVAM_API_KEY),
        "gemini_configured": bool(GEMINI_API_KEY),
    }


# ═══════════════════════════════════════════════════════════════════
#  LANGUAGES
# ═══════════════════════════════════════════════════════════════════

@app.get("/languages")
def list_languages():
    """Return all supported languages with their codes."""
    languages = [
        {"code": code, "name": LANG_NAMES[code], "bcp47": LANG_CODES[code]}
        for code in LANG_CODES
    ]
    return {"languages": languages}


# ═══════════════════════════════════════════════════════════════════
#  OCR ENDPOINT
# ═══════════════════════════════════════════════════════════════════

@app.post("/ocr")
async def ocr_endpoint(
    file: UploadFile = File(...),
    languages: Optional[str] = Form(None),
):
    """
    Extract text from an uploaded image using EasyOCR.

    - **file**: Image file (PNG, JPG, etc.)
    - **languages**: Comma-separated EasyOCR language codes (e.g. 'hi,en').
                     Defaults to the preconfigured subset.
    """
    # Parse language list
    lang_list = (
        [l.strip() for l in languages.split(",") if l.strip()]
        if languages
        else DEFAULT_OCR_LANGUAGES
    )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file.")

    try:
        result = extract_text_from_image(image_bytes, lang_list)
        return {"success": True, **result}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════
#  TRANSLATE ENDPOINT
# ═══════════════════════════════════════════════════════════════════

@app.post("/translate")
def translate_endpoint(req: TranslateRequest):
    """
    Translate text between Indian languages using Sarvam AI.

    - **text**: The text to translate (max 1000 chars).
    - **source_language_code**: Source language ('auto', 'hi', 'hi-IN', etc.).
    - **target_language_code**: Target language ('en', 'en-IN', etc.).
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required.")

    try:
        result = translate_text(
            text=req.text.strip(),
            source_language_code=req.source_language_code,
            target_language_code=req.target_language_code,
        )
        return {
            "success": True,
            "original_text": req.text.strip(),
            "translated_text": result["translated_text"],
            "source_language_code": result["source_language_code"],
            "source_language_name": get_language_name(result["source_language_code"]),
            "target_language_code": req.target_language_code,
            "target_language_name": get_language_name(req.target_language_code),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


# ═══════════════════════════════════════════════════════════════════
#  SPEECH-TO-TEXT ENDPOINT
# ═══════════════════════════════════════════════════════════════════

@app.post("/speech-to-text")
async def stt_endpoint(
    file: UploadFile = File(...),
    language_code: str = Form("unknown"),
    mode: str = Form("transcribe"),
):
    """
    Transcribe audio to text using Sarvam AI (saaras:v3).

    - **file**: Audio file (WAV, MP3, OGG, WebM, etc.)
    - **language_code**: BCP-47 code or 'unknown' for auto-detect.
    - **mode**: 'transcribe' | 'translate' | 'verbatim' | 'translit' | 'codemix'
    """
    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    try:
        result = speech_to_text(
            audio_bytes=audio_bytes,
            filename=file.filename or "audio.wav",
            language_code=language_code,
            mode=mode,
        )
        return {"success": True, **result}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


# ═══════════════════════════════════════════════════════════════════
#  TEXT-TO-SPEECH ENDPOINT
# ═══════════════════════════════════════════════════════════════════

@app.post("/text-to-speech")
def tts_endpoint(req: TTSRequest):
    """
    Convert text to speech audio using Sarvam AI (bulbul:v3).

    - **text**: Text to synthesize (max 2500 chars).
    - **target_language_code**: Output language (BCP-47).
    - **speaker**: Voice name (e.g. 'shubh', 'priya').
    - **pace**: Speech speed (0.5 – 2.0).
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required.")

    try:
        result = text_to_speech(
            text=req.text.strip(),
            target_language_code=req.target_language_code,
            speaker=req.speaker,
            pace=req.pace,
        )
        return {"success": True, **result}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


# ═══════════════════════════════════════════════════════════════════
#  SPEECH-TO-SPEECH ENDPOINT
# ═══════════════════════════════════════════════════════════════════

@app.post("/speech-to-speech")
async def speech_to_speech_endpoint(
    file: UploadFile = File(...),
    target_language_code: str = Form("hi-IN"),
    speaker: str = Form(DEFAULT_TTS_SPEAKER),
    pace: float = Form(DEFAULT_TTS_PACE),
):
    """
    Full speech-to-speech pipeline:
      User speaks → Transcribe → Translate to English → Translate to target → TTS audio

    - **file**: Audio file from the user.
    - **target_language_code**: Language for the reply audio.
    - **speaker**: TTS voice name.
    - **pace**: TTS speech pace.
    """
    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    try:
        result = speech_to_speech(
            audio_bytes=audio_bytes,
            filename=file.filename or "audio.wav",
            target_language_code=target_language_code,
            speaker=speaker,
            pace=pace,
        )
        return {"success": True, **result}
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


# ═══════════════════════════════════════════════════════════════════
#  FULL GRIEVANCE PROCESSING (Gemini + Sarvam — called by Node.js backend)
# ═══════════════════════════════════════════════════════════════════

@app.post("/process-grievance-full")
async def process_grievance_full_endpoint(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    source_language_code: str = Form("auto"),
):
    """
    Full pipeline: extract → translate (Sarvam) → analyse (Gemini 2.0 Flash).

    Called exclusively by the Node.js backend over Docker internal network.
    Returns the complete structured result the backend stores in MongoDB.
    """
    return await process_grievance_full(text, image, audio, source_language_code)


# ═══════════════════════════════════════════════════════════════════
#  UNIFIED GRIEVANCE PROCESSING ENDPOINT
#  (Called by the Node.js backend over Docker internal network)
# ═══════════════════════════════════════════════════════════════════

@app.post("/process-grievance")
async def process_grievance(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    source_language_code: str = Form("auto"),
):
    """
    Unified grievance processing endpoint.

    Accepts any combination of:
    - **text**: Direct text complaint.
    - **image**: Image containing complaint text (OCR'd).
    - **audio**: Voice complaint (transcribed).
    - **source_language_code**: Language hint ('auto' for auto-detect).

    Processing pipeline:
      1. Extract text from whichever input is provided.
      2. Translate to English.
      3. Return structured result for the backend to store.
    """
    extracted_text = ""
    input_type = ""
    detected_language = source_language_code

    # ── Priority: audio > image > text ────────────────────────────
    if audio is not None:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file.")

        stt_result = speech_to_text(
            audio_bytes=audio_bytes,
            filename=audio.filename or "audio.wav",
            language_code="unknown",
            mode="transcribe",
        )
        extracted_text = stt_result["transcript"]
        detected_language = stt_result.get("language_code", "unknown")
        input_type = "audio"

    elif image is not None:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image file.")

        ocr_result = extract_text_from_image(image_bytes)
        extracted_text = ocr_result["extracted_text"]
        input_type = "image"

    elif text and text.strip():
        extracted_text = text.strip()
        input_type = "text"

    else:
        raise HTTPException(
            status_code=400,
            detail="At least one of 'text', 'image', or 'audio' is required.",
        )

    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail=f"Could not extract any text from the provided {input_type} input.",
        )

    # ── Translate to English ──────────────────────────────────────
    try:
        translation = translate_text(
            text=extracted_text,
            source_language_code=detected_language,
            target_language_code="en-IN",
        )
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    source_lang_code = translation.get("source_language_code", detected_language)

    return {
        "success": True,
        "original_text": extracted_text,
        "english_text": translation["translated_text"],
        "source_language": get_language_name(source_lang_code),
        "source_language_code": source_lang_code,
        "input_type": input_type,
    }