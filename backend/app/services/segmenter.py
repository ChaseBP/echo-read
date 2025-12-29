import unicodedata


def normalize_text(text: str) -> str:
    """
    -Nomalize line endings
    -Preserver content meaning
    -Gemini offsets and Python slicing aligns
    """
    text = text.replace("\r\n", "\n")
    text = unicodedata.normalize("NFKC", text)
    return text


def chunk_by_offsets(text: str, segments: list[dict]):
    """
    Slice text into segments based on offsets.
    """

    chunks = []

    for seg in segments:
        start = seg["start_char"]
        end = seg["end_char"]

        chunk_text = text[start:end]

        chunks.append(
            {
                "text": chunk_text,
                "role": seg["role"],
                "emotion": seg["emotion"],
                "intensity": int(seg["intensity"]),
                "audio_tag": seg.get("audio_tag", "none"),
            }
        )
    return chunks


def merge_adjacent_segments(segments: list[dict]):
    """
    Merge adjacent segments if they have the same
    role, emotion, intensity, and audio_tag.
    """

    if not segments:
        return []

    merged = [segments[0]]

    for current in segments[1:]:
        prev = merged[-1]

        can_merge = (
            prev["role"] == current["role"]
            and prev["emotion"] == current["emotion"]
            and prev["intensity"] == current["intensity"]
            and prev.get("audio_tag", "none") == current.get("audio_tag", "none")
            and prev["end_char"] == current["start_char"]
        )

        if can_merge:
            # Extend previous segment
            prev["end_char"] = current["end_char"]
        else:
            merged.append(current)
    return merged
