# app.py
import os
from flask import Flask, request, jsonify
import boto3, requests, tempfile

app = Flask(__name__)

S3_BUCKET = os.getenv("S3_BUCKET")
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
ROBOFLOW_MODEL_URL = os.getenv("ROBOFLOW_MODEL_URL")  # e.g., https://detect.roboflow.com/<model>/<version>

s3 = boto3.client("s3")

@app.route("/infer", methods=["POST"])
def infer():
    # Expect JSON: { "s3_key": "uploads/your_image.jpg" }
    data = request.get_json()
    s3_key = data["s3_key"]

    # Download image from S3
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        s3.download_fileobj(S3_BUCKET, s3_key, tmp)
        tmp_path = tmp.name

    # Send to Roboflow Hosted Inference
    with open(tmp_path, "rb") as f:
        resp = requests.post(
            ROBOFLOW_MODEL_URL,
            params={"api_key": ROBOFLOW_API_KEY},
            files={"file": f}
        )
    rf = resp.json()

    # Convert results to our schema
    detections = []
    for p in rf.get("predictions", []):
        detections.append({
            "class_label": p.get("class", "tree"),
            "confidence": p.get("confidence", 0),
            "bbox_x": int(p["x"] - p["width"]/2),
            "bbox_y": int(p["y"] - p["height"]/2),
            "bbox_w": int(p["width"]),
            "bbox_h": int(p["height"])
        })

    return jsonify({"count": len(detections), "detections": detections})
