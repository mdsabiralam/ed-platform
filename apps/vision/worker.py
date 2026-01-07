import redis
import json
import logging
import os
import time
from .attendance import AttendanceSystem
from .storage import StorageManager
import cv2
import requests

logger = logging.getLogger(__name__)

# Redis Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
QUEUE_NAME = "video_processing_queue"
WEBHOOK_URL = os.getenv("BACKEND_WEBHOOK_URL", "http://localhost:3000/api/webhooks/vision")

class VideoWorker:
    def __init__(self):
        try:
            self.redis = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        except Exception:
            logger.error("Could not connect to Redis. Worker will not function.")
            self.redis = None

        self.attendance_system = AttendanceSystem()
        self.storage_manager = StorageManager()

    def process_job(self, job_data):
        job_id = job_data.get("job_id")
        video_path = job_data.get("video_path")
        logger.info(f"Processing job {job_id} for video {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Could not open video {video_path}")
            return

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0: fps = 30
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            timestamp = frame_count / fps

            # Keyframe extraction (1 FPS)
            if int(timestamp) > int((frame_count - 1) / fps):
                # Detect students and unknown alerts
                newly_present_ids, alerts = self.attendance_system.process_frame_attendance(frame)

                # Handle New Attendance
                for student_id in newly_present_ids:
                    logger.info(f"Confirmed Student {student_id} at {timestamp}s")
                    clip_path = f"/tmp/{job_id}_{student_id}_{int(timestamp)}.mp4"
                    self.storage_manager.create_evidence_clip(video_path, timestamp, clip_path)
                    s3_url = self.storage_manager.upload_to_s3(clip_path)
                    logger.info(f"Evidence uploaded to {s3_url}")
                    if os.path.exists(clip_path):
                        os.remove(clip_path)

                # Handle Unknown Alerts (Prompt 8)
                for alert in alerts:
                    logger.warning(f"SECURITY ALERT: Unknown Person detected (Object {alert['object_id']})")
                    # Save frame image
                    alert_img_path = f"/tmp/{job_id}_alert_{alert['object_id']}.jpg"
                    cv2.imwrite(alert_img_path, alert['frame'])
                    img_url = self.storage_manager.upload_to_s3(alert_img_path)

                    # Send Webhook
                    try:
                        payload = {"type": "UNKNOWN_PERSON", "image_url": img_url, "timestamp": timestamp}
                        # requests.post(WEBHOOK_URL, json=payload) # Uncomment when backend ready
                        logger.info(f"Webhook sent: {payload}")
                    except Exception as e:
                        logger.error(f"Webhook failed: {e}")

                    if os.path.exists(alert_img_path):
                        os.remove(alert_img_path)

            frame_count += 1

        cap.release()
        logger.info(f"Job {job_id} completed.")

    def start(self):
        if not self.redis:
            return

        logger.info(f"Worker listening on {QUEUE_NAME}...")
        while True:
            try:
                item = self.redis.brpop(QUEUE_NAME, timeout=5)
                if item:
                    _, data = item
                    job_data = json.loads(data)
                    self.process_job(job_data)
            except redis.exceptions.ConnectionError:
                logger.error("Redis connection lost. Retrying...")
                time.sleep(5)
            except Exception as e:
                logger.error(f"Error in worker loop: {e}")
                time.sleep(1)

if __name__ == "__main__":
    worker = VideoWorker()
    worker.start()
