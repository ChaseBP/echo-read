import json

import google.generativeai as genai

from app.config import GEMINI_API_KEY
from app.models.narration import NarrationConfig

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
    "sarcastically"
]

MODEL_NAME = "gemini-2.5-flash-lite"


SYSTEM_PROMPT = """
You are a story performance analysis engine for an adaptive AI narrator.

Your job:
Analyze light novel text and decide how a voice actor should perform it.

You must:
- Understand emotional shifts
- Detect tension, relief, calm, excitement
- Decide if a short audio performance cue is helpful
- Decide who is speaking (narrator, male character, or female character)

Important rules:
- Audio cues are OPTIONAL
- If used, they must be placed BEFORE the sentence they apply to
- Do NOT overuse cues
- Use cues only when emotion clearly changes
- Think like a voice actor, not a machine
- Do NOT add explanations, comments, or extra text outside the JSON.

CRITICAL RULE:
- Always return exactly ONE JSON object
- If the text contains multiple sentences or roles, return the configuration for the DOMINANT sentence only
"""

SCHEMA_DESCRIPTION = f"""
Return JSON in this exact format:

{{
  "scene_type": "dialogue | narration | inner_monologue | action",
  "speaker_role": "narrator | male_character | female_character",
  "emotion": "calm | tense | romantic | anxious | dramatic | relieved | excited | sad | angry",
  "intensity": 1-5,
  "pace": "slow | medium | fast",
  "pause_after_sentence": true | false,
  "audio_tag": "ONE word only OR 'none'.
                Must be chosen strictly from this list:"
                {', '.join(SUPPORTED_AUDIO_TAGS)}.
                Use 'none' if no audio cue is needed.
                Do NOT invent new tags.
                Do NOT use commas or spaces."
}}
"""
def analyze_story(text: str, reader_feedback: str | None):
    """
    Uses Gemini to analyze story text and return narration config.
    Falls back to safe defaults if Gemini fails.
    """

    if not GEMINI_API_KEY:
        return _fallback_config(reader_feedback)

    prompt = f"""
{SYSTEM_PROMPT}

Reader feedback: {reader_feedback}

Text:
\"\"\"{text}\"\"\"

{SCHEMA_DESCRIPTION}
"""
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)

        raw_text = response.text.strip()

        json_start = raw_text.find("{")
        json_end = raw_text.rfind("}") + 1
        if json_start == -1 or json_end == -1:
            raise ValueError("No JSON object found in Gemini response")
        json_str = raw_text[json_start:json_end]
        print(f"Gemini raw response: {raw_text}")


        data = json.loads(json_str)
        data["intensity"] = int(data["intensity"])

        return NarrationConfig(**data)
    except Exception as e:
        print(f"Error analyzing story with Gemini: {e}")
        return _fallback_config(reader_feedback)


def _fallback_config(reader_feedback: str | None):
    emotion = "calm"
    intensity = 2

    if reader_feedback == "more_dramatic":
        emotion = "dramatic"
        intensity = 4

    return NarrationConfig(
        scene_type="narration",
        speaker_role="narrator",
        emotion=emotion,
        intensity=intensity,
        pace="medium",
        pause_after_sentence=True,
        audio_tag="none",
    )
