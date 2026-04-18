import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")


def _parse_origins(raw_origins: str | None) -> list[str]:
    if not raw_origins:
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or ["http://localhost:3000"]


CORS_ORIGINS = _parse_origins(os.getenv("CORS_ORIGINS"))
CACHE_MAX_ITEMS = max(int(os.getenv("CACHE_MAX_ITEMS", "24")), 1)
MAX_TEXT_CHARS = max(int(os.getenv("MAX_TEXT_CHARS", "12000")), 1000)
