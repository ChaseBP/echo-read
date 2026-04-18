import base64
import copy
import hashlib
import json
from collections import OrderedDict
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.config import CACHE_MAX_ITEMS
from app.models.narration import (
    NarrationConfig,
    NarrationRequest,
    NarrationResponse,
)
from app.services.segmenter import (
    chunk_by_offsets,
    merge_adjacent_segments,
    normalize_text,
)
from app.services.story_ai import analyze_story, realign_segments
from app.services.voice_ai import synthesize_voice

_ANALYSIS_CACHE: OrderedDict[str, Any] = OrderedDict()
_AUDIO_CACHE: OrderedDict[str, dict[str, Any]] = OrderedDict()


def _cache_key_for_request(req: NarrationRequest, normalized_text: str) -> str:
    """
    Generate a stable cache key for request inputs that change output.
    """
    payload = {
        "text": normalized_text,
        "direction_mode": req.direction_mode,
        "reader_feedback": req.reader_feedback or "",
    }
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True).encode("utf-8")
    ).hexdigest()


def _cache_get(cache: OrderedDict[str, Any], key: str):
    if key not in cache:
        return None

    cache.move_to_end(key)
    return copy.deepcopy(cache[key])


def _cache_set(cache: OrderedDict[str, Any], key: str, value: Any):
    cache[key] = copy.deepcopy(value)
    cache.move_to_end(key)

    while len(cache) > CACHE_MAX_ITEMS:
        cache.popitem(last=False)


def build_narration_config(segment: dict, global_cfg: dict):
    return NarrationConfig(
        scene_type="dialogue" if segment["role"] != "narrator" else "narration",
        speaker_role=segment["role"],
        emotion=segment["emotion"],
        intensity=segment["intensity"],
        pace=global_cfg.get("default_pace", "medium"),
        pause_after_sentence=True,
        audio_tag=segment["audio_tag"],
    )


def _is_word_char(char: str) -> bool:
    return char.isalnum() or char in {"'", "’", "-"}


def build_word_timeline(char_timeline):
    words = []
    current = None

    for item in char_timeline:
        ch = item["char"]

        if _is_word_char(ch):
            if current is None:
                current = {
                    "word": ch,
                    "start": item["start"],
                    "end": item["end"],
                    "char_start": item["index"],
                    "char_end": item["index"] + 1,
                    "role": item["role"],
                }
            else:
                current["word"] += ch
                current["end"] = item["end"]
                current["char_end"] = item["index"] + 1
        else:
            if current:
                words.append(current)
                current = None

    if current:
        words.append(current)

    return words


def _is_speakable_text(text: str) -> bool:
    return any(char.isalnum() for char in text)


def coalesce_synthesis_segments(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    ElevenLabs rejects inputs that become empty after stripping tags and symbols.
    Fold punctuation-only / whitespace-only chunks into adjacent spoken chunks
    so we keep the text flow without sending empty content to synthesis.
    """

    prepared: list[dict[str, Any]] = []
    leading_buffer = ""

    for segment in segments:
        text = segment["text"]

        if _is_speakable_text(text):
            next_segment = {**segment}
            if leading_buffer:
                next_segment["text"] = f"{leading_buffer}{next_segment['text']}"
                leading_buffer = ""
            prepared.append(next_segment)
            continue

        if prepared:
            prepared[-1]["text"] += text
        else:
            leading_buffer += text

    if leading_buffer and prepared:
        prepared[0]["text"] = f"{leading_buffer}{prepared[0]['text']}"

    return prepared


router = APIRouter(tags=["narration"])


@router.post("/narrate", response_model=NarrationResponse)
def narrate(req: NarrationRequest):
    normalized_text = normalize_text(req.text)
    cache_key = _cache_key_for_request(req, normalized_text)

    cached_response = _cache_get(_AUDIO_CACHE, cache_key)
    if cached_response:
        cached_response["metadata"]["cache_hit"] = True
        return cached_response

    analysis = _cache_get(_ANALYSIS_CACHE, cache_key)
    analysis_cache_hit = analysis is not None

    if analysis is None:
        try:
            analysis = analyze_story(
                normalized_text,
                direction_mode=req.direction_mode,
                reader_feedback=req.reader_feedback,
            )
        except RuntimeError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            ) from exc
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Story analysis failed: {exc}",
            ) from exc

        raw_segments = analysis["segments"]

        try:
            realigned_segments = realign_segments(normalized_text, raw_segments)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Timeline alignment failed: {exc}",
            ) from exc

        analysis = {
            **analysis,
            "segments": merge_adjacent_segments(realigned_segments),
        }
        _cache_set(_ANALYSIS_CACHE, cache_key, analysis)

    segments = coalesce_synthesis_segments(
        chunk_by_offsets(normalized_text, analysis["segments"])
    )
    if not segments:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No speakable narration segments were produced.",
        )

    final_audio = bytearray()
    char_timeline: list[dict[str, Any]] = []
    global_char_index = 0
    timeline: list[dict[str, Any]] = []
    cursor = 0.0

    for segment in segments:
        config = build_narration_config(segment, analysis["global"])

        try:
            result = synthesize_voice(segment["text"], config)
        except RuntimeError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Voice synthesis failed: {exc}",
            ) from exc

        final_audio.extend(result["audio_bytes"])

        alignment = result["alignment"]
        alignment_offset = result.get("alignment_offset", 0)
        segment_start_time = result.get("segment_start_time", 0.0)
        characters = alignment.characters[alignment_offset:]
        start_times = alignment.character_start_times_seconds[alignment_offset:]
        end_times = alignment.character_end_times_seconds[alignment_offset:]

        for i, ch in enumerate(characters):
            char_timeline.append(
                {
                    "char": ch,
                    "index": global_char_index,
                    "start": cursor + max(start_times[i] - segment_start_time, 0.0),
                    "end": cursor + max(end_times[i] - segment_start_time, 0.0),
                    "role": result["role"],
                }
            )
            global_char_index += 1

        timeline.append(
            {
                "role": result["role"],
                "emotion": config.emotion,
                "intensity": config.intensity,
                "start": cursor,
                "end": cursor + result["duration"],
                "text": segment["text"],
                "audio_tag": config.audio_tag or "none",
            }
        )
        cursor += result["duration"]

    word_timeline = build_word_timeline(char_timeline)

    response = NarrationResponse(
        audio=base64.b64encode(bytes(final_audio)).decode("utf-8"),
        timeline=timeline,
        char_timeline=char_timeline,
        word_timeline=word_timeline,
        metadata={
            "cache_hit": False,
            "analysis_cache_hit": analysis_cache_hit,
            "segment_count": len(timeline),
            "word_count": len(word_timeline),
            "duration_seconds": round(cursor, 3),
            "dominant_emotion": analysis["global"]["dominant_emotion"],
            "default_pace": analysis["global"]["default_pace"],
            "direction_mode": req.direction_mode,
        },
    ).model_dump()

    _cache_set(_AUDIO_CACHE, cache_key, response)

    return response
