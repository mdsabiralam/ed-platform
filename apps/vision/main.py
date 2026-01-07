from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
import uvicorn
import os
import shutil
import uuid
import json
import redis
import logging
from .worker import QUEUE_NAME, REDIS_HOST, REDIS_PORT, VideoWorker
from .storage import StorageManager
import threading
import time

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Video Analytics Service")

# Redis Connection
try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
except Exception:
    redis_client = None
    logger.warning("Redis not available. Async tasks will fail.")

# Storage for uploads
UPLOAD_DIR = "/tmp/video_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Cron / Cleanup
storage_manager = StorageManager()
def run_cleanup():
    while True:
        try:
            storage_manager.cleanup_old_files(UPLOAD_DIR)
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        time.sleep(3600) # Run every hour

cleanup_thread = threading.Thread(target=run_cleanup, daemon=True)
cleanup_thread.start()

# Start Worker Thread (for simplicity in this single service deployment)
def run_worker():
    worker = VideoWorker()
    worker.start()

worker_thread = threading.Thread(target=run_worker, daemon=True)
worker_thread.start()


@app.post("/vision/bus-attendance")
async def upload_bus_video(file: UploadFile = File(...)):
    """
    Receives video chunks from bus cameras.
    Saves file and queues for processing.
    """
    # Security: Sanitize filename (Prompt 4 / Review)
    if not file.filename.endswith(('.mp4', '.avi', '.mov')):
         raise HTTPException(status_code=400, detail="Invalid file format")

    # Use UUID only for storage to prevent traversal
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{os.path.basename(file.filename)}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"File save error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save video")

    # Queue Job
    job_data = {
        "job_id": file_id,
        "video_path": file_path,
        "original_filename": file.filename,
        "uploaded_at": time.time()
    }

    if redis_client:
        try:
            redis_client.lpush(QUEUE_NAME, json.dumps(job_data))
            return {"status": "queued", "job_id": file_id}
        except Exception as e:
            logger.error(f"Redis error: {e}")
            raise HTTPException(status_code=500, detail="Failed to queue job")
    else:
        # Fallback if Redis missing (e.g. dev env without redis)
        return {"status": "error", "message": "Redis unavailable"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
