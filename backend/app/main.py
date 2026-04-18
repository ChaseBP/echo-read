from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.narrate import router as narrate_router
from app.config import CORS_ORIGINS, ELEVENLABS_API_KEY, GEMINI_API_KEY

app = FastAPI(
    title="EchoRead API",
    version="0.2.0",
    description="Directed AI narration service for multi-voice story playback.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(narrate_router)


@app.get("/")
def health():
    return {
        "status": "ok",
        "services": {
            "gemini_configured": bool(GEMINI_API_KEY),
            "elevenlabs_configured": bool(ELEVENLABS_API_KEY),
        },
    }


@app.get("/health")
def detailed_health():
    return health()
