import re
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
    Slice text into segments based on Gemini-provided offsets.
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


def validate_segment_coverage(text: str, segments: list[dict]):
    """
    Validate that segments fully and cleanly cover the input text.
    """

    print("\n🔍 validate_segment_coverage called")
    print("Text length:", len(text))
    print("Segments received:", segments)

    if not segments:
        print("❌ No segments provided")
        return False

    text_length = len(text)

    # First segment must start at 0 (or only skip whitespace)
    if segments[0]["start_char"] != 0:
        leading = text[: segments[0]["start_char"]]
        print("⚠️ First segment does not start at 0")
        print("Leading text:", repr(leading))
        if leading.strip() != "":
            print("❌ Leading non-whitespace detected")
            return False
        else:
            print("✅ Leading whitespace allowed")

    for i, seg in enumerate(segments):
        start = seg["start_char"]
        end = seg["end_char"]

        print(f"\nSegment {i}: start={start}, end={end}")

        # Boundary checks
        if start < 0:
            print("❌ start_char < 0")
            return False

        if end > text_length:
            print("❌ end_char exceeds text length")
            return False

        if start >= end:
            print("❌ start_char >= end_char")
            return False

        # Continuity checks
        if i > 0:
            prev_end = segments[i - 1]["end_char"]
            gap = text[prev_end:start]

            print(f"Gap between segment {i - 1} and {i}:", repr(gap))

            if start != prev_end and gap.strip() != "":
                print("❌ Non-whitespace gap detected")
                return False
            else:
                print("✅ Gap OK")

    # Trailing content check
    last_end = segments[-1]["end_char"]
    if last_end < text_length:
        trailing = text[last_end:]
        print("\nTrailing text after last segment:", repr(trailing))

        if re.search(r"[A-Za-z0-9]", trailing):
            # Auto-attach trailing text to last segment
            print("⚠️ Attaching trailing text to last segment instead of failing")
            segments[-1]["end_char"] = text_length
    print("✅ Segment coverage VALID\n")
    return True


def fallback_segments(text: str):
    """
    Fallback: Narrator only for entire text.
    """

    return [
        {
            "start_char": 0,
            "end_char": len(text),
            "role": "narrator",
            "emotion": "calm",
            "intensity": 2,
            "audio_tag": "none",
        }
    ]
