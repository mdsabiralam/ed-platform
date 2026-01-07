import face_recognition
import cv2
import numpy as np
from scipy.spatial import distance as dist

class FaceService:
    def __init__(self):
        # Initialize the model (dlib's models are loaded by face_recognition)
        pass

    def preprocess_image(self, file_stream):
        """
        Step 8: Image Preprocessing (Optimization)
        Resizes input image to max 800px width and converts to RGB.
        """
        # Load image using face_recognition (uses PIL)
        image = face_recognition.load_image_file(file_stream)

        # Resize if width > 800
        h, w = image.shape[:2]
        if w > 800:
            scale = 800 / w
            new_h = int(h * scale)
            # Use OpenCV for resizing as it's faster
            image = cv2.resize(image, (800, new_h))

        return image

    def detect_face_locations(self, image):
        """
        Step 3.1: Detect face location
        """
        # hog is faster than cnn, usually sufficient for frontal faces
        return face_recognition.face_locations(image, model="hog")

    def generate_encoding(self, image, known_face_locations=None):
        """
        Step 3.2: Generate 128-d encoding
        """
        encodings = face_recognition.face_encodings(image, known_face_locations)
        if not encodings:
            return None
        return encodings[0]

    def eye_aspect_ratio(self, eye):
        # compute the euclidean distances between the two sets of
        # vertical eye landmarks (x, y)-coordinates
        A = dist.euclidean(eye[1], eye[5])
        B = dist.euclidean(eye[2], eye[4])
        # compute the euclidean distance between the horizontal
        # eye landmark (x, y)-coordinates
        C = dist.euclidean(eye[0], eye[3])
        # compute the eye aspect ratio
        ear = (A + B) / (2.0 * C)
        return ear

    def check_liveness(self, image_frames):
        """
        Step 4: Liveness Detection (Anti-Spoofing)
        Analyzes Eye Aspect Ratio (EAR) logic to ensure blinking.
        Input: List of image frames (numpy arrays)
        Returns: Boolean (True if liveness confirmed)
        """
        blink_detected = False
        EYE_AR_THRESH = 0.25  # Threshold for blink

        for frame in image_frames:
            landmarks_list = face_recognition.face_landmarks(frame)
            if not landmarks_list:
                continue

            face_landmarks = landmarks_list[0]
            left_eye = face_landmarks['left_eye']
            right_eye = face_landmarks['right_eye']

            leftEAR = self.eye_aspect_ratio(left_eye)
            rightEAR = self.eye_aspect_ratio(right_eye)

            avg_ear = (leftEAR + rightEAR) / 2.0

            if avg_ear < EYE_AR_THRESH:
                blink_detected = True
                break

        return blink_detected
