from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import io
import sys
import os

# Add src to path to import services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.transcriber import TranscriberService
from services.nlp import NLPService
from services.mapper import CommandMapper

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
transcriber_service = TranscriberService()
nlp_service = NLPService()
command_mapper = CommandMapper()

class VoiceCommandResponse(BaseModel):
    text: str
    intent: str
    entities: dict
    redirectUrl: str | None

@app.post("/ai/voice/command", response_model=VoiceCommandResponse)
async def voice_command(file: UploadFile = File(...), language: str | None = Form(None)):
    try:
        # 1. Receive audio stream
        audio_bytes = await file.read()

        # 2. Process/Transcribe (Privacy: In-memory only)
        # Note: language can be passed if known
        text = transcriber_service.transcribe(audio_bytes, language=language)

        # 3. Discard binary audio data (Handled by Python GC after function exit)

        # 4. Intent Classification
        intent = nlp_service.determine_intent(text)

        # 5. Entity Extraction
        entities = nlp_service.extract_entities(text)

        # 6. Action Mapping
        redirect_url = command_mapper.get_redirect_url(intent, entities)

        # Log (Prompt 9: Log only transcribed text)
        print(f"COMMAND LOG: {text} -> {intent}")

        return {
            "text": text,
            "intent": intent,
            "entities": entities,
            "redirectUrl": redirect_url
        }

    except Exception as e:
        print(f"Error processing voice command: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
