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


def analyze_story(text: str):
    """
    Single-pass Gemini analysis.
    Returns a structured performance plan.
    """

    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key missing")

    prompt = f"""
{SYSTEM_PROMPT}

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

    return json.loads(raw[start:end])
