from fastapi import FastAPI
from app.api import voice
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ed Platform AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice.router, prefix="/ai/voice", tags=["voice"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
