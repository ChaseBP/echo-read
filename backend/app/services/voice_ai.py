import base64
import time

from app.config import ELEVENLABS_API_KEY
from elevenlabs.client import ElevenLabs
from elevenlabs.core.api_error import ApiError

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

VOICE_IDS = {
    "narrator": "BIvP0GN1cAtSRTxNHnWS",  # Jane
    "male_character": "TX3LPaxmHKxFdv7VOQHJ",  # Liam
    "female_character": "cgSgspJ2msm6clMCkdW9",  # Jessica
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
                apply_text_normalization="on",
            )
        except ApiError:
            if attempt >= retries:
                raise
            print(f" ElevenLabs error, retrying ({attempt + 1}/{retries})...")
            time.sleep(delay)


def _select_voice_id(config):
    """
    Select ElevenLabs voice ID based on narration config.
    """

    return VOICE_IDS.get(config.speaker_role, VOICE_IDS["narrator"])


def _map_voice_settings(config):
    """
    Mapping narration config -> ElevenLabs v3 voice settings.
    """
    if config.emotion in ["dramatic", "anxious", "tense", "angry", "excited"]:
        stability = 0.0  # Creative (expressive, unstable delivery)

    elif config.emotion in ["romantic", "relieved", "sad"]:
        stability = 0.5  # Natural (controlled emotion)

    else:  # calm, narration, default
        stability = 1.0  # Robust (steady narrator voice)

    style = min(1.0, 0.3 + (config.intensity * 0.15))

    return {
        "stability": stability,
        "similarity_boost": 0.75,
        "style": style,
        "use_speaker_boost": True,
    }


def _shape_text(text: str, config):
    """
    Shape narration text using voice-cues.
    """

    shaped_text = text

    if hasattr(config, "audio_tag") and config.audio_tag != "none":
        shaped_text = f"[{config.audio_tag}]\n{shaped_text}"

    # Pace shaping
    if config.pace == "fast":
        shaped_text = shaped_text.replace(", ", " ")
        shaped_text = shaped_text.replace(". ", ".\n")
    elif config.pace == "slow":
        shaped_text = shaped_text.replace(". ", "...\n")

    return shaped_text


def synthesize_voice(text: str, narration_config):
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

    audio_base64 = response.audio_base_64
    alignment = response.normalized_alignment

    duration = alignment.character_end_times_seconds[-1]

    return {
        "audio_bytes": base64.b64decode(audio_base64),
        "duration": duration,
        "role": narration_config.speaker_role,
        "alignment": alignment,
        "text": shaped_text,
    }
