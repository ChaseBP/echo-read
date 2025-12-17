from typing import Optional

from pydantic import BaseModel


class NarrationRequest(BaseModel):
    text: str
    reader_feedback: Optional[str] = None
    previous_emotion: Optional[str] = None


class NarrationConfig(BaseModel):
    scene_type: str
    emotion: str
    intensity: int
    pace: str
    pause_after_sentence: bool
    audio_tag: Optional[str] = "none"
