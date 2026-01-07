from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import jwt
import logging
from app.tasks import process_heavy_job
from utils.image_processor import process_image
from models.loader import check_cuda
import torch

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Engine Microservice")

# CORS Setup
origins = [
    "http://localhost:3000", # NestJS Default
    "http://localhost:3001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Auth Dependency
JWT_SECRET = os.getenv("JWT_SECRET", "secretKey") # Must match NestJS

async def verify_token(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class ProcessRequest(BaseModel):
    data: str

class ProcessResponse(BaseModel):
    message: str
    job_id: str = None

# Routes

@app.get("/health")
def health_check():
    """
    Checks status of GPU and Redis.
    """
    health_status = {
        "status": "ok",
        "gpu": "unavailable",
        "redis": "unknown"
    }

    # Check GPU
    if torch.cuda.is_available():
        try:
            # Simple allocation check
            t = torch.tensor([1.0], device='cuda')
            health_status["gpu"] = "operational"
            health_status["gpu_name"] = torch.cuda.get_device_name(0)
            health_status["gpu_memory_allocated"] = torch.cuda.memory_allocated(0)
        except Exception as e:
            health_status["gpu"] = f"error: {str(e)}"
            health_status["status"] = "warning"
    else:
        health_status["gpu"] = "cpu_only"

    # Check Redis (via Celery)
    try:
        from app.tasks import celery_app
        with celery_app.connection_for_read() as conn:
            conn.ensure_connection(max_retries=1)
            health_status["redis"] = "connected"
    except Exception as e:
        health_status["redis"] = f"disconnected: {str(e)}"
        health_status["status"] = "warning"

    return health_status

@app.post("/process", response_model=ProcessResponse)
async def process_data(request: ProcessRequest, user=Depends(verify_token)):
    """
    Accepts JSON data, triggers a background task, and returns immediate response.
    """
    logger.info(f"Received process request from user: {user.get('sub')}")

    # Trigger Celery task
    task = process_heavy_job.delay({"input": request.data})

    return {
        "message": "Job Accepted",
        "job_id": task.id
    }

@app.post("/process-image")
async def process_image_endpoint(file: UploadFile = File(...), user=Depends(verify_token)):
    """
    Accepts an image file, processes it (grayscale), and returns metadata.
    """
    try:
        contents = await file.read()
        gray_image = process_image(contents)
        return {
            "message": "Image processed successfully",
            "shape": gray_image.shape
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/test-connection")
def test_connection(request: ProcessRequest):
    """
    Simple Hello World for integration testing.
    Auth is optional for this test route to simplify initial integration,
    or can be added if strict security is needed.
    """
    if request.data == "Hello":
        return {"message": "World"}
    return {"message": f"Echo: {request.data}"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
