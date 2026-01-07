import os
import json
import psycopg2
from pgvector.psycopg2 import register_vector
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest
from face_service import FaceService
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
face_service = FaceService()

# Database connection
def get_db_connection():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    # Enable vector extension support in the driver
    register_vector(conn)
    return conn

@app.route('/vision/register-face', methods=['POST'])
def register_face():
    """
    Step 3: Face Registration API
    """
    if 'image' not in request.files or 'userId' not in request.form:
        raise BadRequest("Missing image or userId")

    file = request.files['image']
    user_id = request.form['userId']

    # Step 8: Preprocessing
    image = face_service.preprocess_image(file)

    # 1. Detect face location
    locations = face_service.detect_face_locations(image)

    # 4. If no face or multiple faces are found, throw BadRequestException
    if not locations:
        raise BadRequest("No face detected")
    if len(locations) > 1:
        raise BadRequest("Multiple faces detected")

    # 2. Generate the 128-d encoding
    encoding = face_service.generate_encoding(image, locations)

    # 3. Store this array/vector in the face_embeddings table
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Step 9: Security - RLS ensures only permitted roles can insert (assumed handled by DB user perms in prod)
        cur.execute(
            "INSERT INTO face_embeddings (id, user_id, embedding) VALUES (gen_random_uuid(), %s, %s)",
            (user_id, encoding)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"status": "success", "message": "Face registered successfully"})

@app.route('/vision/identify', methods=['POST'])
def identify():
    """
    Step 5: Face Identification API
    """
    if 'image' not in request.files:
        raise BadRequest("Missing image")

    file = request.files['image']

    # Preprocess
    image = face_service.preprocess_image(file)

    # Detect
    locations = face_service.detect_face_locations(image)
    if not locations:
        return jsonify({"userId": None, "message": "No face detected"}), 404

    # 1. Generate embedding
    encoding = face_service.generate_encoding(image, [locations[0]])

    # Step 6: Confidence Threshold Logic
    THRESHOLD = 0.6

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 2. Perform Nearest Neighbor search using <-> (Euclidean distance)
        # Step 7: Index Optimization (HNSW) is used automatically by the index created in migration
        cur.execute(
            """
            SELECT user_id, embedding <-> %s AS distance
            FROM face_embeddings
            ORDER BY distance ASC
            LIMIT 1
            """,
            (encoding,)
        )
        row = cur.fetchone()

        if row:
            user_id, distance = row
            # 3. Return userId if match < threshold
            if distance < THRESHOLD:
                return jsonify({
                    "userId": user_id,
                    "distance": float(distance),
                    "status": "MATCHED"
                })
            else:
                return jsonify({
                    "userId": "UNKNOWN_PERSON",
                    "distance": float(distance),
                    "status": "NO_MATCH"
                })
        else:
            return jsonify({"userId": "UNKNOWN_PERSON", "distance": None})

    finally:
        cur.close()
        conn.close()

@app.route('/vision/liveness', methods=['POST'])
def liveness():
    """
    Step 4: Liveness Detection
    Accepts multiple images to check for blinking.
    """
    # In a real scenario, this might receive a video file or a list of base64 images
    # For simplicity, we assume 'images' is a list of files
    files = request.files.getlist('images')
    if not files:
        raise BadRequest("No images provided")

    frames = [face_service.preprocess_image(f) for f in files]

    is_live = face_service.check_liveness(frames)

    if is_live:
        return jsonify({"status": "LIVE", "message": "Liveness confirmed"})
    else:
        return jsonify({"status": "SPOOF", "message": "Liveness check failed"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
