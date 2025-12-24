import base64
import hashlib
from typing import Any, Dict

from app.models.narration import NarrationConfig, NarrationRequest
from app.services.segmenter import (
    chunk_by_offsets,
    fallback_segments,
    merge_adjacent_segments,
    normalize_text,
    validate_segment_coverage,
)
from app.services.story_ai import analyze_story
from app.services.voice_ai import synthesize_voice
from fastapi import APIRouter

# Gemini cache dictionary
_GEMINI_CACHE: Dict[str, Any] = {}


def _cache_key_for_text(text: str) -> str:
    """
    Generate a hashed cache key for the given text.
    """
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def build_narration_config(segment: dict, global_cfg: dict):
    return NarrationConfig(
        scene_type="dialogue" if segment["role"] != "narrator" else "narration",
        speaker_role=segment["role"],
        emotion=segment["emotion"],
        intensity=segment["intensity"],
        pace=global_cfg["default_pace"],
        pause_after_sentence=True,
        audio_tag=segment["audio_tag"],
    )


router = APIRouter()


@router.post("/narrate")
def narrate(req: NarrationRequest):
    normalized_text = normalize_text(req.text)
    cache_key = _cache_key_for_text(normalized_text)

    if cache_key in _GEMINI_CACHE:
        print("✅ Gemini cache hit")
        analysis = _GEMINI_CACHE[cache_key]
        merged_segments = merge_adjacent_segments(analysis["segments"])
    else:
        print("❌ Gemini cache miss -> calling Gemini")
        analysis = analyze_story(normalized_text)
        raw_segments = analysis["segments"]
        merged_segments = merge_adjacent_segments(raw_segments)

        if validate_segment_coverage(normalized_text, merged_segments):
            _GEMINI_CACHE[cache_key] = analysis
        else:
            print("⚠️ Invalid segment coverage. Using narrator-only fallback.")
            print(
                "Length of Normalized Text:",
                len(normalized_text),
                "Final end_char:",
                merged_segments[-1]["end_char"],
            )
            merged_segments = fallback_segments(normalized_text)

    segments = chunk_by_offsets(normalized_text, merged_segments)

    final_audio = b""
    timeline = []
    cursor = 0.0

    for segment in segments:
        config = build_narration_config(segment, analysis["global"])

        result = synthesize_voice(segment["text"], config)

        final_audio += result["audio_bytes"]

        timeline.append(
            {
                "role": result["role"],
                "start": cursor,
                "end": cursor + result["duration"],
            }
        )
        cursor += result["duration"]
    return {
        "audio": base64.b64encode(final_audio).decode("utf-8"),
        "timeline": timeline,
    }
