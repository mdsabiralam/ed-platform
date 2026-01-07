import os
import json
import logging
import asyncio
import uuid
import datetime
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
import uvicorn
import asyncpg
from prometheus_client import make_asgi_app

from utils import track_latency, calculate_checksum
from model_loader import ModelLoader

# App Setup
app = FastAPI(title="School AI Engine")
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

logger = logging.getLogger("ai_engine")
model_loader = ModelLoader()

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password123@postgres:5432/ed_platform")

async def get_db_connection():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# Drift Detection Background Task
class DriftMonitor:
    def __init__(self):
        self.confidences = []
        self.lock = asyncio.Lock()

    async def add_confidence(self, score: float):
        async with self.lock:
            self.confidences.append({'score': score, 'timestamp': datetime.datetime.now()})

    async def check_drift(self):
        while True:
            await asyncio.sleep(3600) # Check every hour (simplified from 24h for demo)
            async with self.lock:
                # Filter last 24 hours
                cutoff = datetime.datetime.now() - datetime.timedelta(hours=24)
                recent = [x['score'] for x in self.confidences if x['timestamp'] > cutoff]

                if recent:
                    avg_score = sum(recent) / len(recent)
                    logger.info(f"Drift Check: Average Confidence = {avg_score}")
                    if avg_score < 0.70:
                        logger.warning("Model Drift Detected! Average confidence below 70%. Triggering alert.")
                        # Code to send alert to Admin Dashboard (e.g., via webhook or DB insert)

                # Cleanup old data
                self.confidences = [x for x in self.confidences if x['timestamp'] > cutoff]

drift_monitor = DriftMonitor()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(drift_monitor.check_drift())
    logger.info("AI Engine Started")

# Models
class ReloadRequest(BaseModel):
    model_name: str
    version: str
    s3_url: str
    checksum: str

class InferenceRequest(BaseModel):
    image_hash: str # simulated input

# Endpoints

@app.post("/admin/ai/upload-model")
async def upload_model(
    model_name: str,
    version: str,
    file: UploadFile = File(...),
    conn = Depends(get_db_connection)
):
    if not (file.filename.endswith('.pth') or file.filename.endswith('.onnx')):
        raise HTTPException(status_code=400, detail="Invalid file format")

    # 1. Save locally temporarily to calc checksum and upload
    temp_filename = f"/tmp/{file.filename}"
    with open(temp_filename, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    checksum = calculate_checksum(temp_filename)

    # 2. Upload to S3
    s3_key = f"{model_name}/{version}/{file.filename}"
    s3_url = f"s3://school-ai-models/{s3_key}"

    try:
        # Mocking S3 upload
        if os.getenv("MOCK_S3", "false") == "true":
             logger.info(f"Mock Upload to {s3_url}")
        else:
             s3 = boto3.client('s3') # creds from env
             s3.upload_file(temp_filename, "school-ai-models", s3_key)
    except Exception as e:
        os.remove(temp_filename)
        raise HTTPException(status_code=500, detail=f"S3 Upload failed: {str(e)}")

    os.remove(temp_filename)

    # 3. Insert into DB
    try:
        await conn.execute("""
            INSERT INTO model_registry (id, model_name, version, s3_url, checksum, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
        """, str(uuid.uuid4()), model_name, version, s3_url, checksum)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

    return {"status": "success", "s3_url": s3_url, "checksum": checksum}

@app.post("/admin/ai/reload")
async def reload_model(request: ReloadRequest):
    try:
        await model_loader.reload(
            request.model_name,
            request.version,
            request.s3_url,
            request.checksum
        )
        return {"status": "reloaded", "version": request.version}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Reload failed: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/inference")
@track_latency
async def inference(request: InferenceRequest):
    model = model_loader.model
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Simulated Inference
    # In real world: output = model(input)
    import random
    confidence = random.uniform(0.6, 0.99)

    # Log Decision
    decision_log = {
        'timestamp': datetime.datetime.now().isoformat(),
        'input_image_hash': request.image_hash,
        'detected_class': f"User_{random.randint(100, 999)}",
        'confidence': confidence,
        'model_version': model_loader.current_version
    }
    logger.info(json.dumps(decision_log))

    # Drift Detection
    await drift_monitor.add_confidence(confidence)

    return decision_log

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
