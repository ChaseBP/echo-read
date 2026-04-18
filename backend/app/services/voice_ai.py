import base64
import time

from app.config import ELEVENLABS_API_KEY
from elevenlabs.client import ElevenLabs
from elevenlabs.core.api_error import ApiError

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

VOICE_IDS = {
    "narrator": "SAz9YHcvj6GT2YYXdXww",  # Jane
    "male_character": "CwhRBWXzGAHq8TQ4Fs17",  # Liam
    "female_character": "FGY2WhTYpPnrIDTdsKH5",  # Jessica
}


def _tts_with_retry(
    client,
    *,
    voice_id,
    model_id,
    text,
    voice_settings,
    retries=2,
    delay=0.5,
):
    """
    Wrapper for ElevenLabs TTS with retry logic.
    """
    for attempt in range(retries + 1):
        try:
            return client.text_to_speech.convert_with_timestamps(
                voice_id=voice_id,
                model_id=model_id,
                text=text,
                voice_settings=voice_settings,
                apply_text_normalization="off",
            )
        except ApiError:
            if attempt >= retries:
                raise
            print(f" ElevenLabs error, retrying ({attempt + 1}/{retries})...")
            time.sleep(delay)


def _map_voice_settings(config):
    """
    Emotion + intensity driven voice control.
    Compatible with ElevenLabs v3 stability constraints.
    """

    # 1. Defaults (Natural narration)
    settings = {
        "stability": 0.5,  # MUST be 0.0 | 0.5 | 1.0
        "style": 0.0,
        "speed": 1.0,
        "use_speaker_boost": True,
        "similarity_boost": 0.75,
    }

    # 2. Emotion → baseline intent (NOT final stability)
    emotion_map = {
        "calm": {"intent": "robust", "style": 0.10, "speed": 1.00},
        "tense": {"intent": "creative", "style": 0.45, "speed": 1.05},
        "anxious": {"intent": "creative", "style": 0.50, "speed": 1.03},
        "angry": {"intent": "creative", "style": 0.65, "speed": 1.05},
        "excited": {"intent": "creative", "style": 0.60, "speed": 1.06},
        "dramatic": {"intent": "creative", "style": 0.65, "speed": 1.00},
        "sad": {"intent": "natural", "style": 0.30, "speed": 0.94},
        "romantic": {"intent": "natural", "style": 0.35, "speed": 0.97},
        "relieved": {"intent": "natural", "style": 0.25, "speed": 0.98},
    }

    if config.emotion in emotion_map:
        base = emotion_map[config.emotion]

        # Map intent → legal stability
        settings["stability"] = {
            "creative": 0.0,
            "natural": 0.5,
            "robust": 1.0,
        }[base["intent"]]

        settings["style"] = base["style"]
        settings["speed"] = base["speed"]

    pace_adjustment = {
        "slow": -0.05,
        "medium": 0.0,
        "fast": 0.04,
    }
    settings["speed"] += pace_adjustment.get(config.pace, 0.0)

    # 3. Intensity scaling (ONLY affects style, never stability)
    # intensity -> [1–5]
    intensity_factor = (config.intensity - 1) / 4.0
    settings["style"] += intensity_factor * 0.25

    # 4. audio_tag → extra expressiveness
    if getattr(config, "audio_tag", None) not in (None, "none"):
        settings["style"] += 0.10

    # 5. Safety clamps
    return {
        "stability": settings["stability"],
        "style": round(min(settings["style"], 1.0), 2),
        "speed": round(min(max(settings["speed"], 0.88), 1.12), 2),
        "use_speaker_boost": True,
        "similarity_boost": 0.75,
    }


def _shape_text(text: str, config):
    """
    Shape narration text using voice-cues.
    """

    # Get the audio tag from config
    if getattr(config, "audio_tag", None) not in (None, "none"):
        prefix = f"[{config.audio_tag}]\n"
        return f"{prefix}{text}"
    return text


def synthesize_voice(text: str, narration_config, previous_text=None, next_text=None):
    """
    Returns:
    {
      audio: base64 audio,
      alignment: normalized character timestamps
    }
    """
    if not ELEVENLABS_API_KEY:
        raise RuntimeError("ElevenLabs API key missing.")

    voice_id = VOICE_IDS.get(narration_config.speaker_role, VOICE_IDS["narrator"])

    voice_settings = _map_voice_settings(narration_config)

    shaped_text = _shape_text(text, narration_config)

    response = _tts_with_retry(
        client,
        voice_id=voice_id,
        model_id="eleven_v3",
        text=shaped_text,
        voice_settings=voice_settings,
    )

    alignment = response.alignment or response.normalized_alignment
    if alignment is None or not alignment.characters:
        raise ValueError("ElevenLabs returned no alignment data.")

    alignment_text = "".join(alignment.characters)
    alignment_offset = alignment_text.find(text) if text else 0
    alignment_offset = max(alignment_offset, 0)

    segment_start_time = alignment.character_start_times_seconds[alignment_offset]

    duration = max(
        alignment.character_end_times_seconds[-1] - segment_start_time,
        0.0,
    )

    return {
        "audio_bytes": base64.b64decode(response.audio_base_64),
        "duration": duration,
        "role": narration_config.speaker_role,
        "alignment": alignment,
        "alignment_offset": alignment_offset,
        "segment_start_time": segment_start_time,
        "text": shaped_text,
    }
