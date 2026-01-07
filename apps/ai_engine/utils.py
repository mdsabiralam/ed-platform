import os
import hashlib
import time
import asyncio
import logging
from functools import wraps
from prometheus_client import Histogram

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ai_engine")

# Prometheus Metrics
INFERENCE_LATENCY = Histogram('inference_latency_seconds', 'Time taken for inference', ['model_name'])

def calculate_checksum(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def track_latency(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            return result
        finally:
            duration = time.time() - start_time
            # Log to Prometheus
            INFERENCE_LATENCY.labels(model_name=kwargs.get('model_name', 'unknown')).observe(duration)

            # Log warning if exceeds 2 seconds
            if duration > 2.0:
                logger.warning(f"High latency detected in {func.__name__}: {duration:.4f}s")

            # Log structured data (simplified here, more detailed in main pipeline)
            logger.info(f"Execution of {func.__name__} took {duration:.4f}s")
    return wrapper
