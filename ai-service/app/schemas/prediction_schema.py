"""
Pydantic schemas for the Demand Prediction API.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    price: float = Field(..., gt=0, description="Current product unit price in LKR", example=500.0)
    stock: int = Field(..., ge=0, description="Current inventory level in units", example=120)
    orders: int = Field(..., ge=0, description="Current month demand/orders in units", example=150)
    lag1Orders: Optional[int] = Field(
        None, ge=0, description="Previous month demand (t-1). Defaults to current orders if omitted.", example=140
    )
    rollingMean3: Optional[float] = Field(
        None, ge=0, description="3-month rolling average demand. Defaults to current orders if omitted.", example=145.0
    )
    month: Optional[int] = Field(
        None, ge=1, le=12, description="Target forecast calendar month (1-12). Defaults to next calendar month.", example=6
    )
    productName: Optional[str] = Field(
        None, description="Optional product identifier or name", example="Cinnamon Powder"
    )

class ConfidenceInterval(BaseModel):
    minDemand: int
    maxDemand: int

class PredictionResponse(BaseModel):
    success: bool = True
    productName: Optional[str] = None
    predictedDemand: int = Field(..., description="Projected units demanded for next month")
    confidenceRange: ConfidenceInterval = Field(..., description="Estimated prediction interval based on model MAE")
    featuresUsed: Dict[str, Any]
    modelType: str = "LinearRegression"
    modelMae: float = 14.23
