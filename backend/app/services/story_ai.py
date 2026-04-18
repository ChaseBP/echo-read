import json

import google.generativeai as genai
from app.config import GEMINI_API_KEY
from rapidfuzz import fuzz

genai.configure(api_key=GEMINI_API_KEY)

SUPPORTED_AUDIO_TAGS = [
    "whispers",
    "shouting",
    "laughs",
    "giggles",
    "sighs",
    "breathless",
    "panicked",
    "angrily",
    "excited",
    "sadly",
    "softly",
    "calmly",
    "intensely",
    "relieved",
    "nervously",
    "sarcastically",
]

MODEL_NAME = "gemini-3-flash-preview"

SUPPORTED_ROLES = {"narrator", "male_character", "female_character"}
SUPPORTED_EMOTIONS = {
    "calm",
    "tense",
    "anxious",
    "dramatic",
    "romantic",
    "relieved",
    "excited",
    "sad",
    "angry",
}
SUPPORTED_PACES = {"slow", "medium", "fast"}
DIRECTION_GUIDANCE = {
    "cinematic": (
        "Lean into contrast, pace shifts, and emotional clarity. "
        "Use higher intensities when a scene clearly earns them."
    ),
    "grounded": (
        "Favor restraint and realism. Keep performances subtle unless the text "
        "contains unmistakable conflict or urgency."
    ),
    "intimate": (
        "Favor softness, breath, and emotional nuance. Prefer close, vulnerable "
        "delivery over broad theatrical choices."
    ),
}


SYSTEM_PROMPT = """
You are a story performance analysis engine.

Your task is to segment the given story into performable chunks
for an adaptive AI narrator.

You must:
- Detect narration vs dialogue
- Identify speaker roles
- Understand emotional shifts
- Assign emotion, intensity, and optional audio cues

CRITICAL SEGMENTATION RULES:
- Each segment MUST include the exact text it represents
- Never split words
- Prefer sentence or clause boundaries
- The concatenation of all segment.text values MUST recreate the full input text exactly
- Do NOT calculate character offsets
- Do NOT summarize or paraphrase text
- Return EXACTLY ONE JSON object
"""

SCHEMA_DESCRIPTION = f"""
Return JSON in this exact format:

{{
  "global": {{
    "dominant_emotion": "calm | tense | anxious | dramatic | romantic | relieved | excited | sad | angry",
    "default_pace": "slow | medium | fast"
  }},
  "segments": [
    {{
      "text": "Exact substring from the source text",
      "role": "narrator | male_character | female_character",
      "emotion": "calm | tense | anxious | dramatic | romantic | relieved | excited | sad | angry",
      "intensity": 1-5,
      "audio_tag": "none | {", ".join(SUPPORTED_AUDIO_TAGS)}"
    }}
  ]
}}

Rules:
- Return EXACTLY ONE JSON object
- Do NOT include start_char or end_char
- Segments must fully cover the text when concatenated
"""


def realign_segments(original_text: str, segments: list[dict]):
    """
    Converts Gemini's text based segments into exact character offsets.
    """

    corrected = []
    cursor = 0
    text_len = len(original_text)

    for seg in segments:
        seg_text = seg.get("text", "")

        if not seg_text:
            continue

        # Check for exact match
        start = original_text.find(seg_text, cursor)

        # Fallback using fuzzy matching in rare cases
        if start == -1:
            search_end = min(cursor + len(seg_text) + 300, text_len)
            window = original_text[cursor:search_end]

            best_score = 0
            best_offset = None

            for i in range(0, len(window), 5):
                slice_ = window[i : i + len(seg_text) + 20]
                score = fuzz.partial_ratio(seg_text, slice_)

                if score > best_score:
                    best_score = score
                    best_offset = i

            if best_score >= 91 and best_offset is not None:
                start = cursor + best_offset
            else:
                raise ValueError(
                    f"Failed to realign segment text:\n"
                    f"Segment text: {seg_text[:40]!r}\n"
                    f"Cursor at position: {cursor}"
                )

        end = start + len(seg_text)

        corrected.append(
            {
                **seg,
                "start_char": start,
                "end_char": end,
            }
        )

        cursor = end

    # Ensure trailing whitespace is covered
    if corrected and corrected[-1]["end_char"] < len(original_text):
        corrected[-1]["end_char"] = len(original_text)

    return corrected


def _normalize_analysis(payload: dict) -> dict:
    global_cfg = payload.get("global", {})
    dominant_emotion = global_cfg.get("dominant_emotion", "calm")
    default_pace = global_cfg.get("default_pace", "medium")

    if dominant_emotion not in SUPPORTED_EMOTIONS:
        dominant_emotion = "calm"

    if default_pace not in SUPPORTED_PACES:
        default_pace = "medium"

    raw_segments = payload.get("segments", [])
    if not isinstance(raw_segments, list) or not raw_segments:
        raise ValueError("Gemini returned no usable segments.")

    normalized_segments = []
    for segment in raw_segments:
        if not isinstance(segment, dict):
            continue

        text = str(segment.get("text", ""))
        if not text:
            continue

        role = segment.get("role", "narrator")
        emotion = segment.get("emotion", dominant_emotion)
        intensity = segment.get("intensity", 3)
        audio_tag = segment.get("audio_tag", "none")

        if role not in SUPPORTED_ROLES:
            role = "narrator"

        if emotion not in SUPPORTED_EMOTIONS:
            emotion = dominant_emotion

        try:
            intensity = int(intensity)
        except (TypeError, ValueError):
            intensity = 3

        normalized_segments.append(
            {
                "text": text,
                "role": role,
                "emotion": emotion,
                "intensity": max(1, min(5, intensity)),
                "audio_tag": str(audio_tag or "none"),
            }
        )

    if not normalized_segments:
        raise ValueError("Gemini returned empty narration segments.")

    return {
        "global": {
            "dominant_emotion": dominant_emotion,
            "default_pace": default_pace,
        },
        "segments": normalized_segments,
    }


def analyze_story(
    text: str,
    *,
    direction_mode: str = "cinematic",
    reader_feedback: str | None = None,
):
    """
    Single-pass Gemini analysis.
    Returns a structured performance plan.
    """

    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key missing")

    direction_note = DIRECTION_GUIDANCE.get(
        direction_mode,
        DIRECTION_GUIDANCE["cinematic"],
    )
    reader_feedback_note = (
        f"\nReader direction: {reader_feedback.strip()}"
        if reader_feedback and reader_feedback.strip()
        else ""
    )

    prompt = f"""
{SYSTEM_PROMPT}

Performance direction:
- Mode: {direction_mode}
- Guidance: {direction_note}{reader_feedback_note}

Text:
\"\"\"{text}\"\"\"

{SCHEMA_DESCRIPTION}
"""

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(prompt)

    raw = response.text.strip()

    start = raw.find("{")
    end = raw.rfind("}") + 1

    if start == -1 or end == -1:
        raise ValueError("No JSON found in Gemini response")

    try:
        parsed = json.loads(raw[start:end])
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON returned by Gemini: {exc}") from exc

    return _normalize_analysis(parsed)
