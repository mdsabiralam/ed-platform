from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import shutil
import os
from .classifier import DocumentClassifier
from .ocr_service import OcrService
from .parser import Parser
from .image_processing import blur_faces
import cv2
import numpy as np

app = FastAPI()

# Initialize services
classifier = DocumentClassifier()
ocr_service = OcrService()
parser = Parser()

@app.post("/ocr/form-extract")
def form_extract(
    file: UploadFile = File(...),
    expected_doc_type: str = Form(None)
):
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    file_location = f"{temp_dir}/{file.filename}"

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Validation Logic (Prompt 7)
        if expected_doc_type:
            result = classifier.classify(file_location)
            predicted_label = result['label']

            if predicted_label != expected_doc_type:
                # We return a 400 Bad Request with a warning
                raise HTTPException(
                    status_code=400,
                    detail=f"Incorrect Document Type: Looks like an {predicted_label}"
                )

        # OCR and Parsing Logic (Prompt 10 Integration)
        raw_text = ocr_service.extract_text(file_location)
        parsed_data = parser.parse(raw_text)

        # Privacy Blurring (Prompt 9 Integration)
        # We'll save a blurred copy to demonstrate the functionality
        try:
             # Re-read image for blurring since it might be modified or we want clean start
             image = cv2.imread(file_location)
             if image is not None:
                 blurred_image = blur_faces(image)
                 blurred_filename = f"blurred_{file.filename}"
                 blurred_path = f"{temp_dir}/{blurred_filename}"
                 cv2.imwrite(blurred_path, blurred_image)
                 # In a real app we might return the blurred image URL or replace the original
                 # For now, just logging it happened or returning in response
                 parsed_data['privacy_protected_file'] = blurred_filename

                 # Cleanup blurred file immediately for this exercise to keep clean
                 if os.path.exists(blurred_path):
                     os.remove(blurred_path)
        except Exception as e:
            print(f"Blurring failed: {e}")

        return {
            "status": "received",
            "filename": file.filename,
            "extracted_data": parsed_data
        }
    finally:
        # Cleanup temp file
        if os.path.exists(file_location):
            os.remove(file_location)
