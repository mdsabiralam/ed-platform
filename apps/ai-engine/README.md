# AI Engine Service

This service provides Voice AI capabilities including Speech-to-Text (STT) via OpenAI Whisper, Intent Classification, and Entity Extraction.

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run Service:**
    ```bash
    python src/main.py
    ```
    The server will start on `http://0.0.0.0:8000`.

## API Endpoints

### POST /ai/voice/command
Accepts an audio file (WAV/MP3) and returns the transcribed text, intent, extracted entities, and a redirect URL.

**Request:**
- `file`: Audio file (binary)
- `language`: (Optional) Language code (e.g., 'bn', 'en', 'hi')

**Response:**
```json
{
  "text": "Class 5 er result dekhbo",
  "intent": "VIEW_REPORT",
  "entities": {
    "class": "5"
  },
  "redirectUrl": "/academic/result?class=5"
}
```

## Architecture
- **TranscriberService:** Uses `openai-whisper` for STT.
- **NLPService:** Regex/Keyword based intent and entity extraction.
- **CommandMapper:** Maps intents to frontend routes.
