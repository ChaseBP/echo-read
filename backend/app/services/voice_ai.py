import base64
import re 

from elevenlabs.client import ElevenLabs

from app.config import ELEVENLABS_API_KEY

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

VOICE_IDS = {
    "narrator": "BIvP0GN1cAtSRTxNHnWS", # Jane
    "male_character": "TX3LPaxmHKxFdv7VOQHJ", #Liam
    "female_character": "cgSgspJ2msm6clMCkdW9" #Jessica 
}

# Identify quoted text for voice handling
QUOTE_PATTERN = re.compile(r'(".*?")')

def _split_by_quotes(text):
    """
    Splits text into quoted and non-quoted segments.
    Keeps the quotes in the result.
    """
    parts = QUOTE_PATTERN.split(text)
    return [p for p in parts if p.strip()]

def resolve_voice_for_segment(segment: str, config):
    """
    Decide which voice to use for a given text segment.
    """
    if segment.startswith('"') and segment.endswith('"'):
        # Dialogue → use character voice
        return config.speaker_role
    else:
        # Narration → always narrator
        return "narrator"

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

"""
def synthesize_voice(text: str, narration_config):
    
    Generate speech audio using ElevenLabs API.
    Returns base64-encoded audio bytes.
    

    if not ELEVENLABS_API_KEY:
        raise RuntimeError("ElevenLabs API key mising.")

    voice_settings = _map_voice_settings(narration_config)

    # For better speech synthesis
    enriched_text = _shape_text(text, narration_config)

    audio_generator = client.text_to_speech.convert(
        voice_id=_select_voice_id(narration_config),
        model_id="eleven_v3",
        text=enriched_text,
        voice_settings=voice_settings,
    )

    audio_bytes = b"".join(audio_generator)

    return base64.b64encode(audio_bytes).decode("utf-8")
"""
def synthesize_voice(text: str, narration_config):
    if not ELEVENLABS_API_KEY:
        raise RuntimeError("ElevenLabs API key missing.")

    segments = _split_by_quotes(text)
    final_audio = b""

    for segment in segments:
        role = resolve_voice_for_segment(segment, narration_config)

        voice_id = VOICE_IDS.get(role, VOICE_IDS["narrator"])
        voice_settings = _map_voice_settings(narration_config)

        shaped_text = segment.strip()

        # Apply audio tag ONLY once per chunk, and only to dialogue
        if (
            narration_config.audio_tag != "none"
            and role != "narrator"
        ):
            shaped_text = f"[{narration_config.audio_tag}]\n{shaped_text}"

        audio_generator = client.text_to_speech.convert(
            voice_id=voice_id,
            model_id="eleven_v3",
            text=shaped_text,
            voice_settings=voice_settings,
        )

        final_audio += b"".join(audio_generator)

    return base64.b64encode(final_audio).decode("utf-8")
