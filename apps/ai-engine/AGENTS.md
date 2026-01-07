# AI Engine Project

This project implements the Face Recognition Pipeline.

## Setup
1. Install dependencies: `pip install -r requirements.txt`
   Note: `dlib` requires C++ compilation tools (cmake, g++). If installation fails, use the provided Docker container or pre-built wheels.
2. Run the server: `python app.py`

## Environment
- DATABASE_URL: PostgreSQL connection string.

## Components
- `face_service.py`: Core logic for face detection, encoding, and liveness check.
- `app.py`: Flask API endpoints.
- `test_accuracy.py`: verification script.
