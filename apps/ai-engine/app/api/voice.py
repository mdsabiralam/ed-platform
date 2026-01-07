from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.transcriber import transcriber
from app.services.nlp import nlp_service
from app.services.command_mapper import command_mapper
import tempfile
import os
import shutil

router = APIRouter()

@router.post("/command")
async def voice_command(
    file: UploadFile = File(...),
    language: str = Form(None)
):
    """
    Step 3: Voice Command API
    Step 9: Privacy & Data Retention (No Storage) - we use temp file and delete immediately.
    """
    # Verify file type
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be audio.")

    # Save to temp file strictly for processing (Whisper needs a path or complex streaming)
    # We ensure deletion in finally block (Step 9)
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        # Step 1 & 2: Transcribe (with noise reduction inside)
        text = transcriber.transcribe(temp_file_path, language=language)

        # Log transcribed text (Step 9)
        print(f"AUDIT LOG: Transcribed Command: '{text}'")

        # Step 3 & 4: Intent & Entities
        nlp_result = nlp_service.extract_intent(text)

        # Step 5: Action Mapping
        action_result = command_mapper.get_action(nlp_result)

        return {
            "text": text,
            "intent": action_result["intent"],
            "redirectUrl": action_result["redirectUrl"],
            "entities": nlp_result["entities"]
        }

    except Exception as e:
        print(f"Error processing voice command: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Step 9: Immediate deletion
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
