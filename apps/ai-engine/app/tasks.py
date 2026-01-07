from celery import Celery
import os
import time

# Configure Celery to use Redis
# Using generic 'redis' hostname assuming docker-compose, or localhost for local dev
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("ai_tasks", broker=REDIS_URL, backend=REDIS_URL)

@celery_app.task
def process_heavy_job(data: dict):
    """
    Simulates a heavy AI background task.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Starting heavy job with data: {data}")

    # Simulate processing time
    time.sleep(5)

    result = {"status": "completed", "processed_data": data}
    logger.info(f"Job finished: {result}")
    return result
