import base64

from elevenlabs.client import ElevenLabs

from app.config import ELEVENLABS_API_KEY

VOICE_ID = "BIvP0GN1cAtSRTxNHnWS"

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)


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
    Shape narration text using actor-style cues.
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
    Generate speech audio using ElevenLabs API.
    Returns base64-encoded audio bytes.
    """

    if not ELEVENLABS_API_KEY:
        raise RuntimeError("ElevenLabs API key mising.")

    voice_settings = _map_voice_settings(narration_config)

    # For better speech synthesis
    enriched_text = _shape_text(text, narration_config)

    audio_generator = client.text_to_speech.convert(
        voice_id=VOICE_ID,
        model_id="eleven_v3",
        text=enriched_text,
        voice_settings=voice_settings,
    )

    audio_bytes = b"".join(audio_generator)

    return base64.b64encode(audio_bytes).decode("utf-8")
