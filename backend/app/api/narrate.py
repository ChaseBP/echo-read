import base64

from fastapi import APIRouter

from app.models.narration import NarrationRequest
from app.services.chunker import chunk_text
from app.services.story_ai import analyze_story
from app.services.voice_ai import synthesize_voice

router = APIRouter()


@router.post("/narrate")
def narrate(req: NarrationRequest):
    # Get beats(segmented text) from chunker
    beats = chunk_text(req.text)

    final_audio_bytes = b""
    last_config = None

    # Process each beat

    for beat in beats:
        narration_config = analyze_story(beat, req.reader_feedback)

        # Normalize audio_tag
        if not hasattr(narration_config, "audio_tag") or not narration_config.audio_tag:
            narration_config.audio_tag = "none"
        # print(
        #     f"BEAT: {beat[:40]}... | "
        #     f"emotion={narration_config.emotion} | "
        #     f"audio_tag={narration_config.audio_tag}"
        # )

        audio_base64 = synthesize_voice(beat, narration_config)

        audio_bytes = base64.b64decode(audio_base64)
        final_audio_bytes += audio_bytes

        last_config = narration_config

    final_audio_base64 = base64.b64encode(final_audio_bytes).decode("utf-8")

    return {
        "narration_config": last_config.model_dump(),
        "beats_processed": len(beats),
        "audio": final_audio_base64,
    }
