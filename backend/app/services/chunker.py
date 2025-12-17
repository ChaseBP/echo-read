def chunk_text(text: str):
    """
    Split text into small narrative beats (1–2 sentences).
    """
    sentences = [s.strip() for s in text.split(".") if s.strip()]

    beats = []
    buffer = []

    for s in sentences:
        buffer.append(s)
        if len(buffer) == 2:
            beats.append(". ".join(buffer) + ".")
            buffer = []

    if buffer:
        beats.append(". ".join(buffer) + ".")

    return beats

