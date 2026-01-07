import whisper
import torch
import noisereduce as nr
import numpy as np
from scipy.io import wavfile
import io
import os

class TranscriberService:
    def __init__(self):
        # Load the base model, optimized for speed
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = whisper.load_model("base", device=device)
        self.device = device
        print(f"TranscriberService initialized on {device}")

    def clean_audio(self, audio_data: np.ndarray, rate: int) -> np.ndarray:
        """
        Filters out background static using noisereduce.
        """
        # Perform noise reduction
        reduced_noise = nr.reduce_noise(y=audio_data, sr=rate)
        return reduced_noise

    def transcribe(self, audio_bytes: bytes, language: str = None) -> str:
        """
        Transcribes audio bytes to text.
        Supports auto-detection if language is None.
        """
        try:
            # Save bytes to a temporary file to load with whisper/scipy or load directly
            # Whisper load_audio expects a path or a numpy array of float32

            # Use scipy to read wav bytes if possible, or ffmpeg via whisper
            # For simplicity with raw bytes, we can write to temp file
            import tempfile

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                tmp_file.write(audio_bytes)
                tmp_path = tmp_file.name

            try:
                # Pre-processing: Noise Reduction
                # We need to read it as numpy array first
                rate, data = wavfile.read(tmp_path)

                # If stereo, convert to mono
                if len(data.shape) > 1:
                    data = data.mean(axis=1)

                cleaned_data = self.clean_audio(data, rate)

                # Whisper expects float32 audio, normalized to [-1, 1]
                # wavfile reads as int16 usually.
                if cleaned_data.dtype == np.int16:
                    cleaned_data = cleaned_data.astype(np.float32) / 32768.0

                # Transcribe
                options = {}
                if language:
                    options["language"] = language

                # We can pass the numpy array directly to transcribe
                result = self.model.transcribe(cleaned_data, **options)
                return result["text"].strip()

            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

        except Exception as e:
            print(f"Error during transcription: {e}")
            raise e
