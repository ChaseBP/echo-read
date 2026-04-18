from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.config import MAX_TEXT_CHARS

Emotion = Literal[
    "calm",
    "tense",
    "anxious",
    "dramatic",
    "romantic",
    "relieved",
    "excited",
    "sad",
    "angry",
]
VoiceRole = Literal["narrator", "male_character", "female_character"]
Pace = Literal["slow", "medium", "fast"]
DirectionMode = Literal["cinematic", "grounded", "intimate"]


class NarrationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(..., min_length=1, max_length=MAX_TEXT_CHARS)
    direction_mode: DirectionMode = "cinematic"
    reader_feedback: Optional[str] = None
    previous_emotion: Optional[Emotion] = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Text cannot be empty.")
        if len(value) > MAX_TEXT_CHARS:
            raise ValueError(
                f"Text is too long. Keep requests under {MAX_TEXT_CHARS} characters."
            )
        return value

    @field_validator("reader_feedback")
    @classmethod
    def validate_reader_feedback(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        trimmed = value.strip()
        if not trimmed:
            return None
        return trimmed[:240]


class NarrationConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scene_type: str
    speaker_role: VoiceRole
    emotion: Emotion
    intensity: int
    pace: Pace
    pause_after_sentence: bool
    audio_tag: Optional[str] = "none"


class CharTimelineItem(BaseModel):
    char: str
    index: int
    start: float
    end: float
    role: VoiceRole


class WordTimelineItem(BaseModel):
    word: str
    start: float
    end: float
    char_start: int
    char_end: int
    role: VoiceRole


class TimelineSegment(BaseModel):
    role: VoiceRole
    emotion: Emotion
    intensity: int
    start: float
    end: float
    text: str
    audio_tag: str = "none"


class NarrationMetadata(BaseModel):
    cache_hit: bool = False
    analysis_cache_hit: bool = False
    segment_count: int
    word_count: int
    duration_seconds: float
    dominant_emotion: Emotion
    default_pace: Pace
    direction_mode: DirectionMode


class NarrationResponse(BaseModel):
    audio: str
    timeline: list[TimelineSegment]
    char_timeline: list[CharTimelineItem]
    word_timeline: list[WordTimelineItem]
    metadata: NarrationMetadata
