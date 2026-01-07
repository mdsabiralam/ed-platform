from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
import os
from typing import Optional, List
from marketing.generator import generate_marketing_image, generate_batch_marketing_images

app = FastAPI(title="AI Engine - Marketing Service")

class MarketingRequest(BaseModel):
    template_type: str = "diwali_greeting"
    tenant_name: str
    logo_url: Optional[str] = None
    output_format: str = "webp"
    student_name: Optional[str] = None # For batch/personalization

class BatchMarketingRequest(BaseModel):
    template_type: str = "diwali_greeting"
    tenant_name: str
    logo_url: Optional[str] = None
    students: List[str] # List of student names

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai_engine"}

@app.post("/ai/marketing/generate")
async def generate_marketing_material(request: MarketingRequest):
    try:
        output_path = await generate_marketing_image(
            template_type=request.template_type,
            tenant_name=request.tenant_name,
            logo_url=request.logo_url,
            student_name=request.student_name
        )

        # In a real scenario, we would upload to CDN and return URL.
        # Here we return the file directly or the path.
        # Returning file directly for simplicity in this task.
        return FileResponse(output_path, media_type="image/webp")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/marketing/batch-generate")
async def generate_batch(request: BatchMarketingRequest):
    try:
        results = await generate_batch_marketing_images(
            template_type=request.template_type,
            tenant_name=request.tenant_name,
            logo_url=request.logo_url,
            student_names=request.students
        )
        return {"status": "completed", "generated_files": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
