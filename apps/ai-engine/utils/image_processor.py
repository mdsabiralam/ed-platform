import cv2
import numpy as np

def process_image(image_bytes: bytes) -> np.ndarray:
    """
    Decodes an image buffer and converts it to grayscale.
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)

    # Decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    return gray
