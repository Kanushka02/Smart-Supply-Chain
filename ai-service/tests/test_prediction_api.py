"""
Automated Integration Tests for the FastAPI Demand Prediction Microservice.
Tests endpoints: /, /health, /model-info, /benchmark, and /predict.
"""

import os
import sys

# Ensure ai-service root is on python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Smart Supply Chain AI Service" in data["message"]
    print("PASS: GET /")

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    print("PASS: GET /health")

def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "features" in data["data"]
    assert "mae_units" in data["data"]
    assert data["data"]["r2_score"] > 0.80
    print(f"PASS: GET /model-info (R2: {data['data']['r2_score']}, MAE: {data['data']['mae_units']} units)")

def test_benchmark_endpoint():
    response = client.get("/benchmark")
    assert response.status_code == 200
    data = response.json()
    assert "champion_model" in data
    assert "rankings" in data
    assert len(data["rankings"]) >= 4
    # Champion should have lowest MAE
    rankings = data["rankings"]
    assert rankings[0]["mae_units"] <= rankings[-1]["mae_units"]
    print(f"PASS: GET /benchmark (Champion: {data['champion_model']}, Best MAE: {rankings[0]['mae_units']} units)")

def test_predict_full_payload():
    payload = {
        "price": 500.0,
        "stock": 150,
        "orders": 220,
        "lag1Orders": 210,
        "rollingMean3": 215.0,
        "month": 11,
        "productName": "Cinnamon Powder"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["productName"] == "Cinnamon Powder"
    assert isinstance(data["predictedDemand"], int)
    assert data["predictedDemand"] > 0
    assert "confidenceRange" in data
    assert data["confidenceRange"]["minDemand"] <= data["predictedDemand"] <= data["confidenceRange"]["maxDemand"]
    print(f"PASS: POST /predict (Full Payload) -> Predicted Demand: {data['predictedDemand']} units (Range: {data['confidenceRange']['minDemand']}-{data['confidenceRange']['maxDemand']})")

def test_predict_minimal_payload():
    # Only supply mandatory fields: price, stock, orders
    payload = {
        "price": 720.0,
        "stock": 200,
        "orders": 160,
        "productName": "Black Pepper"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["predictedDemand"], int)
    assert data["predictedDemand"] > 0
    print(f"PASS: POST /predict (Minimal Payload) -> Predicted Demand: {data['predictedDemand']} units")

def test_predict_validation_error():
    # Negative price should trigger Pydantic validation error (422)
    payload = {
        "price": -100.0,
        "stock": 50,
        "orders": 80
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    print("PASS: POST /predict (Validation Error rejected with 422 Unprocessable Entity)")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("RUNNING FASTAPI PREDICTION TESTS")
    print("=" * 60)
    test_root_endpoint()
    test_health_endpoint()
    test_model_info_endpoint()
    test_benchmark_endpoint()
    test_predict_full_payload()
    test_predict_minimal_payload()
    test_predict_validation_error()
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
