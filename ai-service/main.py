"""
Smart Supply Chain AI Service - FastAPI Application.
Provides demand forecasting microservice endpoints for the Node.js backend & React frontend.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.prediction_schema import PredictionRequest, PredictionResponse
from services.prediction import forecaster

app = FastAPI(
    title="Smart Supply Chain AI Service",
    version="1.0.0",
    description="Machine Learning Microservice for Demand Forecasting & Inventory Intelligence",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (allows Node.js backend and React frontend to communicate)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def root():
    return {
        "message": "Smart Supply Chain AI Service is Running 🚀",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["General"])
def health():
    return {
        "status": "healthy",
        "service": "AI Demand Forecasting Microservice",
        "model_loaded": forecaster.model is not None and forecaster.scaler is not None
    }

@app.get("/model-info", tags=["Forecasting"])
def get_model_info():
    """Returns the trained model architecture, evaluation metrics, and feature list."""
    try:
        return {
            "success": True,
            "data": forecaster.get_model_info()
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model info: {str(exc)}"
        )

@app.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Forecasting"],
    summary="Predict next-month product demand"
)
def predict_demand(request: PredictionRequest):
    """
    Predicts expected unit demand for the upcoming month using a trained Linear Regression model.
    Input features include current product price, stock, current orders, recent demand history, and month.
    """
    try:
        prediction_result = forecaster.predict(
            price=request.price,
            stock=request.stock,
            orders=request.orders,
            lag1_orders=request.lag1Orders,
            rolling_mean3=request.rollingMean3,
            month=request.month,
            product_name=request.productName
        )
        return prediction_result
    except FileNotFoundError as fnf_error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model artifacts missing. Train the model first: {str(fnf_error)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction error: {str(exc)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
