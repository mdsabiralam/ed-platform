import cv2
import numpy as np

def stitch_images(image1: np.ndarray, image2: np.ndarray) -> np.ndarray:
    """
    Stitches two images together using OpenCV's Stitcher class.
    Args:
        image1: First image as numpy array.
        image2: Second image as numpy array.
    Returns:
        Stitched image as numpy array.
    """
    stitcher = cv2.Stitcher_create()
    status, stitched = stitcher.stitch([image1, image2])

    if status == cv2.Stitcher_OK:
        return stitched
    else:
        # Handle error if overlap is insufficient or other issues
        print(f"Stitching failed with status code: {status}")
        # Return a simple concatenation as fallback or raise error
        # For now, simplistic horizontal concatenation
        return np.hstack((image1, image2))


def detect_table_grid(image: np.ndarray):
    """
    Detects horizontal and vertical lines to identify the table grid.
    Args:
        image: Input image as numpy array.
    Returns:
        List of intersection points defining cells.
    """
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Adaptive thresholding to get binary image
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY_INV, 11, 2)

    # Define vertical and horizontal kernels
    rows, cols = thresh.shape
    scale = 20

    # Horizontal lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (cols // scale, 1))
    horizontal_mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)

    # Vertical lines
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, rows // scale))
    vertical_mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)

    # Combine masks
    table_mask = cv2.addWeighted(horizontal_mask, 0.5, vertical_mask, 0.5, 0.0)

    # Find intersections (cells)
    # Intersections are where both horizontal and vertical masks are active
    intersections = cv2.bitwise_and(horizontal_mask, vertical_mask)

    # Find coordinates of intersections
    contours, _ = cv2.findContours(intersections, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    intersection_points = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        intersection_points.append((x + w // 2, y + h // 2))

    return intersection_points


def crop_faces(image: np.ndarray, save_path: str = None):
    """
    Detects the largest face, crops it with padding.
    Args:
        image: Input image as numpy array.
        save_path: Optional path to save the cropped image.
    Returns:
        Cropped face image as numpy array, or None if no face found.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Load Haarcascade
    # Assuming cv2.data.haarcascades is available
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)

    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) == 0:
        return None

    # Find the largest face
    largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
    x, y, w, h = largest_face

    # Add padding
    padding = 20
    h_img, w_img, _ = image.shape

    x_start = max(0, x - padding)
    y_start = max(0, y - padding)
    x_end = min(w_img, x + w + padding)
    y_end = min(h_img, y + h + padding)

    cropped_face = image[y_start:y_end, x_start:x_end]

    if save_path:
        cv2.imwrite(save_path, cropped_face)

    return cropped_face


def blur_faces(image: np.ndarray) -> np.ndarray:
    """
    Detects all faces, keeps the largest one clear, and blurs the others.
    Args:
        image: Input image as numpy array.
    Returns:
        Image with secondary faces blurred.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Load Haarcascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)

    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) <= 1:
        return image

    # Find the largest face
    largest_face = max(faces, key=lambda rect: rect[2] * rect[3])

    # Iterate over all faces
    for (x, y, w, h) in faces:
        # Check if this is the largest face (by comparing coordinates)
        if np.array_equal((x, y, w, h), largest_face):
            continue

        # Apply Gaussian Blur to other faces
        roi = image[y:y+h, x:x+w]
        blurred_roi = cv2.GaussianBlur(roi, (23, 23), 30)
        image[y:y+h, x:x+w] = blurred_roi

    return image
