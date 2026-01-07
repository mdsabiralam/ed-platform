import whisper
import torch
import numpy as np
import io
import noisereduce as nr
from scipy.io import wavfile
import tempfile
import subprocess
from app.core.config import settings

class TranscriberService:
    def __init__(self):
        print(f"Loading Whisper model: {settings.WHISPER_MODEL_SIZE}...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = whisper.load_model(settings.WHISPER_MODEL_SIZE, device=device)
        print("Whisper model loaded.")

    def clean_audio(self, audio_path: str) -> str:
        """
        Step 8: Noise Cancellation
        Reads audio, performs noise reduction, saves to a temp file.
        """
        # Note: noisereduce works best on raw numpy arrays or wav files.
        # Since input might be mp3/wav, we rely on ffmpeg to convert to wav first for scipy reading if needed.
        # Or we can let whisper handle it. But the prompt specifically asks for a clean_audio function.

        # Simpler approach: Use ffmpeg to convert to wav, then scipy to read, then noisereduce.
        try:
            # Create a temp wav file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav:
                temp_wav_path = temp_wav.name

            # Convert to wav 16k mono (Whisper likes 16k)
            subprocess.run([
                "ffmpeg", "-y", "-i", audio_path,
                "-ar", "16000", "-ac", "1", "-f", "wav",
                temp_wav_path
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            # Read
            rate, data = wavfile.read(temp_wav_path)

            # Reduce noise
            # If stereo, data is 2D. ffmpeg made it mono (1D).
            # prop_decrease=0.8 is aggressive but good for "busy streets"
            reduced_noise = nr.reduce_noise(y=data, sr=rate, prop_decrease=0.8)

            # Write back
            clean_path = temp_wav_path + "_clean.wav"
            wavfile.write(clean_path, rate, reduced_noise)

            # Cleanup temp
            os.remove(temp_wav_path)

            return clean_path
        except Exception as e:
            print(f"Error in noise reduction: {e}")
            return audio_path # Fallback to original

    def transcribe(self, audio_path: str, language: str = None) -> str:
        """
        Step 1 & 2: Transcribe with multi-language support.
        """
        # Step 8: Noise Cancellation
        cleaned_path = self.clean_audio(audio_path)

        try:
            # Transcribe
            # language=None means auto-detection.
            options = {}
            if language:
                options["language"] = language

            result = self.model.transcribe(cleaned_path, **options)
            return result["text"].strip()
        finally:
            # Cleanup cleaned file if different
            if cleaned_path != audio_path and os.path.exists(cleaned_path):
                os.remove(cleaned_path)

transcriber = TranscriberService()
