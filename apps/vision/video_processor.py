import cv2
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoStreamProcessor:
    def __init__(self, rtsp_url):
        self.rtsp_url = rtsp_url
        self.cap = None
        self.reconnect_delay = 5  # seconds
        self.running = False

    def connect(self):
        while not self.running:
            try:
                self.cap = cv2.VideoCapture(self.rtsp_url)
                if self.cap.isOpened():
                    logger.info("Connected to RTSP stream")
                    self.running = True
                    break
                else:
                    logger.warning("Failed to connect. Retrying in %s seconds...", self.reconnect_delay)
                    time.sleep(self.reconnect_delay)
            except Exception as e:
                logger.error("Connection error: %s", e)
                time.sleep(self.reconnect_delay)

    def read_frame(self, target_fps=1):
        """
        Yields frames at the specified target_fps to optimize processing.
        Assumes the input stream is 30 FPS.
        """
        if not self.cap or not self.running:
            self.connect()

        # Determine frame skip interval (assuming 30fps input for simplicity,
        # but better to read from property if available)
        input_fps = self.cap.get(cv2.CAP_PROP_FPS)
        if input_fps <= 0:
            input_fps = 30 # Default to 30 if unknown

        skip_frames = int(input_fps / target_fps)
        if skip_frames < 1:
            skip_frames = 1

        logger.info(f"Input FPS: {input_fps}. skipping every {skip_frames} frames to achieve {target_fps} FPS processing.")

        frame_count = 0

        while True:
            try:
                ret, frame = self.cap.read()
                if not ret:
                    logger.warning("Frame read failed. Reconnecting...")
                    self.cap.release()
                    self.running = False
                    self.connect()
                    continue

                frame_count += 1
                if frame_count % skip_frames == 0:
                    yield frame

            except Exception as e:
                logger.error("Error reading frame: %s", e)
                self.running = False
                self.connect()

    def stop(self):
        self.running = False
        if self.cap:
            self.cap.release()

if __name__ == "__main__":
    # Test with a dummy file or URL
    pass
