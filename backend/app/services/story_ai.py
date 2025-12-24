import json

import google.generativeai as genai
from app.config import GEMINI_API_KEY

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
You are a story performance analysis engine for an adaptive AI narrator.

Your job:
Analyze the full passage and produce a structured performance plan.

You must:
- Understand emotional shifts across the passage
- Detect dialogue and identify speaker roles
- Decide where a short audio performance cue is helpful

Important rules:
- Return EXACTLY ONE JSON object
- Represent narration and dialogue as separate segments
- Segments must use character offsets (start_char, end_char)
- Audio cues are OPTIONAL and should be sparse
- Do NOT add explanations, comments, or extra text outside the JSON
- Think like a voice director, not a sentence parser
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
      "start_char": number,
      "end_char": number,
      "role": "narrator | male_character | female_character",
      "emotion": "calm | tense | anxious | dramatic | romantic | relieved | excited | sad | angry",
      "intensity": 1-5,
      "audio_tag": "none | {", ".join(SUPPORTED_AUDIO_TAGS)}"
    }}
  ]
}}

Rules:
- Return EXACTLY ONE JSON object
- Segments must not overlap
- Segments must cover the full text
- Use 'none' if no audio cue is needed
"""


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
    print("Gemini raw response:", raw)

    start = raw.find("{")
    end = raw.rfind("}") + 1

    if start == -1 or end == -1:
        raise ValueError("No JSON found in Gemini response")

    return json.loads(raw[start:end])
