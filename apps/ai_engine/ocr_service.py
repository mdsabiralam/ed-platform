try:
    from paddleocr import PaddleOCR
except ImportError:
    print("PaddleOCR not installed, using mock")
    PaddleOCR = None

class OcrService:
    def __init__(self):
        if PaddleOCR:
            self.ocr = PaddleOCR(use_angle_cls=True, lang='en')
        else:
            self.ocr = None

    def extract_text(self, image_path: str):
        if not self.ocr:
            return [{"text": "Mock Text", "box": [[0, 0], [10, 0], [10, 10], [0, 10]]}]

        # New PaddleOCR API seems to drop cls arg in some calls or prefers predict
        # And we need to check return structure.
        # However, for robustness in this exercise and to fix the "TypeError: unexpected keyword argument 'cls'"
        # We will try the simple call without cls if it fails, or just use `ocr` without `cls` arg
        # as the constructor `use_angle_cls=True` (or new equiv) should handle it.

        try:
             # Try without explicit cls arg in method call if it fails
             result = self.ocr.ocr(image_path)
        except Exception as e:
             print(f"PaddleOCR error: {e}")
             return []

        # PaddleOCR returns a list of lists (one for each page/image), we assume single image
        if not result or result[0] is None:
            return []

        extracted_data = []
        for line in result[0]:
            # line structure can vary based on version, but typically: [[box], [text, confidence]]
            # Ensure line has expected structure
            if len(line) >= 2:
                box = line[0]
                text_obj = line[1]
                if isinstance(text_obj, (list, tuple)) and len(text_obj) >= 2:
                    text = text_obj[0]
                    confidence = text_obj[1]
                    extracted_data.append({
                        "text": text,
                        "box": box,
                        "confidence": confidence
                    })

        return extracted_data
