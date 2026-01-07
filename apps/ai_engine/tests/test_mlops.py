import pytest
import asyncio
from httpx import AsyncClient
from main import app, model_loader
import torch
import os

# Mock S3 and DB for tests
os.environ["MOCK_S3"] = "true"

@pytest.mark.asyncio
async def test_version_switch():
    # 1. Setup Initial Model (V1)
    # We need to manually trigger reload since the app starts empty
    v1_checksum = "dummy_checksum_v1"

    # Create dummy V1 file
    # Ensure the filename matches what logic expects: {model_name}_{version}.pth
    torch.save(torch.nn.Linear(10, 2), "/tmp/FaceRec_v1.0.0.pth")
    # For test, we need checksum to match what calculate_checksum returns for this file
    from utils import calculate_checksum
    v1_real_checksum = calculate_checksum("/tmp/FaceRec_v1.0.0.pth")

    from httpx import ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Load V1
        response = await ac.post("/admin/ai/reload", json={
            "model_name": "FaceRec",
            "version": "v1.0.0",
            "s3_url": "s3://school-ai-models/FaceRec/v1.0.0/FaceRec_v1.pth",
            "checksum": v1_real_checksum
        })
        assert response.status_code == 200
        assert response.json()["version"] == "v1.0.0"

        # 2. Call Inference
        response = await ac.post("/inference", json={"image_hash": "abc"})
        assert response.status_code == 200
        assert response.json()["model_version"] == "v1.0.0"

        # 3. Switch to Model V2
        torch.save(torch.nn.Linear(10, 2), "/tmp/FaceRec_v2.0.0.pth")
        v2_real_checksum = calculate_checksum("/tmp/FaceRec_v2.0.0.pth")

        response = await ac.post("/admin/ai/reload", json={
            "model_name": "FaceRec",
            "version": "v2.0.0",
            "s3_url": "s3://school-ai-models/FaceRec/v2.0.0/FaceRec_v2.pth",
            "checksum": v2_real_checksum
        })
        assert response.status_code == 200
        assert response.json()["version"] == "v2.0.0"

        # 4. Call Inference Again
        response = await ac.post("/inference", json={"image_hash": "abc"})
        assert response.status_code == 200
        assert response.json()["model_version"] == "v2.0.0"

    # Cleanup
    if os.path.exists("/tmp/FaceRec_v1.pth"):
        os.remove("/tmp/FaceRec_v1.pth")
    if os.path.exists("/tmp/FaceRec_v2.pth"):
        os.remove("/tmp/FaceRec_v2.pth")
