"""
Prediction Service for Smart Supply Chain AI Microservice.
Loads saved LinearRegression model, feature scaler, and metadata.
Executes standardized feature transformations and returns unit demand forecasts.
"""

import os
import json
import joblib
import datetime
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "demand_model.pkl")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")
METADATA_PATH = os.path.join(MODELS_DIR, "feature_metadata.json")

class DemandForecaster:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.metrics = {}
        self.metadata = {}
        self.feature_columns = ["Price", "Stock", "Orders", "Lag1Orders", "RollingMean3", "Month"]
        self.load_artifacts()

    def load_artifacts(self):
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(
                f"Model or scaler missing in {MODELS_DIR}. Run services/train_model.py first."
            )

        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)

        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                self.metrics = json.load(f)

        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)
                self.feature_columns = self.metadata.get("feature_columns", self.feature_columns)

        print("DemandForecaster: ML model and scaler loaded successfully.")

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "model_type": self.metrics.get("model_type", "LinearRegression"),
            "features": self.feature_columns,
            "target": self.metrics.get("target", "NextMonthOrders"),
            "mae_units": self.metrics.get("mae_units", 14.23),
            "rmse_units": self.metrics.get("rmse_units", 19.78),
            "r2_score": self.metrics.get("r2_score", 0.9259),
            "mape_percent": self.metrics.get("mape_percent", 7.56)
        }

    def predict(
        self,
        price: float,
        stock: int,
        orders: int,
        lag1_orders: float = None,
        rolling_mean3: float = None,
        month: int = None,
        product_name: str = None
    ) -> Dict[str, Any]:
        if self.model is None or self.scaler is None:
            self.load_artifacts()

        # Intelligent defaults for optional features
        if lag1_orders is None:
            lag1_orders = float(orders)

        if rolling_mean3 is None:
            rolling_mean3 = float(orders)

        if month is None:
            next_month = (datetime.date.today().month % 12) + 1
            month = next_month

        features_dict = {
            "Price": float(price),
            "Stock": int(stock),
            "Orders": int(orders),
            "Lag1Orders": float(lag1_orders),
            "RollingMean3": float(rolling_mean3),
            "Month": int(month)
        }

        # Build feature DataFrame matching exact training order
        input_df = pd.DataFrame([features_dict])[self.feature_columns]

        # Scale features using saved scaler
        scaled_input = self.scaler.transform(input_df)

        # Generate model prediction
        raw_prediction = float(self.model.predict(scaled_input)[0])

        # Floor prediction to 0 (cannot have negative product demand)
        predicted_units = max(0, int(round(raw_prediction)))

        # Confidence interval (+/- 1 MAE)
        mae = self.metrics.get("mae_units", 14.23)
        min_demand = max(0, int(round(predicted_units - mae)))
        max_demand = int(round(predicted_units + mae))

        return {
            "success": True,
            "productName": product_name,
            "predictedDemand": predicted_units,
            "confidenceRange": {
                "minDemand": min_demand,
                "maxDemand": max_demand
            },
            "featuresUsed": features_dict,
            "modelType": self.metrics.get("model_type", "LinearRegression"),
            "modelMae": mae
        }

# Global singleton forecaster instance
forecaster = DemandForecaster()
