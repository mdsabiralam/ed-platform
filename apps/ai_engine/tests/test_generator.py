import unittest
import os
from io import BytesIO
from PIL import Image
from fastapi.testclient import TestClient
import sys

# Ensure we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from main import app

# Correct usage for TestClient in newer versions (it inherits from httpx.Client but wraps the app)
# If passing app directly fails in some versions, it usually means dependency mismatch, but TestClient(app) is standard.
# However, the error suggests 'app' argument isn't expected in super().__init__ which means starlette/httpx interaction issue.
# In recent starlette, TestClient uses httpx.Client.
# Let's try explicit transport or check if we need to update starlette/httpx compatibility.
# For now, let's try a safe instantiation.

client = TestClient(app)

class TestMarketingGeneration(unittest.TestCase):
    def test_generate_diwali_greeting(self):
        payload = {
            "tenant_name": "Test School",
            "template_type": "diwali_greeting",
            "student_name": "John Doe"
        }
        response = client.post("/ai/marketing/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "image/webp")

        # Verify content is a valid WebP image
        image = Image.open(BytesIO(response.content))
        self.assertEqual(image.format, "WEBP")
        # Depending on content, size might vary slightly if layout changes, but base template is fixed
        self.assertEqual(image.size, (800, 600))

    def test_logo_overlay(self):
        payload = {
            "tenant_name": "Logo School",
            "template_type": "diwali_greeting",
            "logo_url": "http://invalid-url.com/logo.png"
        }
        response = client.post("/ai/marketing/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        # Falls back to text "Logo Error" drawn on image, which is valid image generation

    def test_batch_generate(self):
        payload = {
            "tenant_name": "Batch School",
            "template_type": "diwali_greeting",
            "students": ["Alice", "Bob"]
        }
        response = client.post("/ai/marketing/batch-generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "completed")
        self.assertEqual(len(data["generated_files"]), 2)

if __name__ == "__main__":
    unittest.main()
