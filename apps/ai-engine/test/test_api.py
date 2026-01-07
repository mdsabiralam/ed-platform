
import pytest
import os
import io
import numpy as np
from scipy.io import wavfile
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def create_dummy_wav(text=""):
    """
    Creates a dummy WAV file in memory.
    Since we can't easily generate speech from text here without a TTS engine,
    we will just create a silent or noise WAV and mock the transcriber in a real test.
    But for integration test, we might mock the TranscriberService.
    """
    rate = 16000
    duration = 1 # seconds
    data = np.random.uniform(-1, 1, rate * duration).astype(np.float32)

    byte_io = io.BytesIO()
    wavfile.write(byte_io, rate, data)
    byte_io.seek(0)
    return byte_io

# Mock the TranscriberService to return specific text for testing
from unittest.mock import MagicMock
from src.main import transcriber_service

def test_voice_command_view_attendance():
    # 1. Simulate user speaking 'Open Attendance for Class 10'
    # We mock the transcribe method to return this text
    transcriber_service.transcribe = MagicMock(return_value="Open Attendance for Class 10")

    # 2. Send dummy audio
    audio_file = create_dummy_wav()
    response = client.post(
        "/ai/voice/command",
        files={"file": ("test.wav", audio_file, "audio/wav")}
    )

    # 3. Assert response
    assert response.status_code == 200
    json_resp = response.json()

    assert json_resp["intent"] == "VIEW_ATTENDANCE"
    assert json_resp["entities"]["class"] == "10"
    assert json_resp["redirectUrl"] == "/attendance/calendar?class=10"

def test_voice_command_view_fees():
    transcriber_service.transcribe = MagicMock(return_value="Show me my fees")

    audio_file = create_dummy_wav()
    response = client.post(
        "/ai/voice/command",
        files={"file": ("test.wav", audio_file, "audio/wav")}
    )

    assert response.status_code == 200
    json_resp = response.json()
    assert json_resp["intent"] == "VIEW_FEES"
    assert json_resp["redirectUrl"] == "/finance/student-dues"
