from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.narrate import router as narrate_router

app = FastAPI(title="EchoRead API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(narrate_router)


@app.get("/")
def health():
    return {"status": "ok"}
