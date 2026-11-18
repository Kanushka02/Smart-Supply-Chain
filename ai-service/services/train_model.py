"""
Model Training & Evaluation for Smart Supply Chain Demand Forecasting.
Trains Linear Regression using a chronological time-series train/test split.
Evaluates using genuine metrics: MAE (in actual product units), RMSE, and R².
Saves both the trained model and the fitted feature scaler to disk.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def train_and_evaluate():
    clean_path = os.path.join("data", "clean_supply_chain.csv")
    if not os.path.exists(clean_path):
        raise FileNotFoundError(f"Clean data not found at {clean_path}. Run preprocessing.py first.")

    df = pd.read_csv(clean_path)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(by="Date").reset_index(drop=True)

    feature_cols = ["Price", "Stock", "Orders", "Lag1Orders", "RollingMean3", "Month"]
    target_col = "NextMonthOrders"

    # =========================================================================
    # 1. Chronological Time-Series Train/Test Split
    # =========================================================================
    # Reserve the final 7 months (2025-05 onwards) across all products for testing (~20%)
    split_date = df["Date"].quantile(0.80)
    train_mask = df["Date"] <= split_date
    test_mask = df["Date"] > split_date

    train_df = df[train_mask]
    test_df = df[test_mask]

    X_train = train_df[feature_cols]
    y_train = train_df[target_col]

    X_test = test_df[feature_cols]
    y_test = test_df[target_col]

    print("=" * 60)
    print("CHRONOLOGICAL TRAIN / TEST SPLIT")
    print("=" * 60)
    print(f"Training Period: {train_df['Date'].min().strftime('%Y-%m')} to {train_df['Date'].max().strftime('%Y-%m')} ({len(X_train)} samples)")
    print(f"Testing Period:  {test_df['Date'].min().strftime('%Y-%m')} to {test_df['Date'].max().strftime('%Y-%m')} ({len(X_test)} samples)")

    # =========================================================================
    # 2. Feature Scaling (Fit on Train ONLY to prevent data leakage)
    # =========================================================================
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # =========================================================================
    # 3. Model Training
    # =========================================================================
    model = LinearRegression()
    model.fit(X_train_scaled, y_train)

    # =========================================================================
    # 4. Model Predictions & Evaluation
    # =========================================================================
    y_pred = model.predict(X_test_scaled)

    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

    print("\n" + "=" * 60)
    print("EVALUATION METRICS ON UNSEEN FUTURE TEST DATA")
    print("=" * 60)
    print(f"MAE  (Mean Absolute Error)     : {mae:.2f} units")
    print(f"RMSE (Root Mean Squared Error) : {rmse:.2f} units")
    print(f"R²   (Coefficient of Determ.)  : {r2:.4f}")
    print(f"MAPE (Mean Abs. Percentage Err): {mape:.2f}%")

    # Feature Importance (Linear Regression Coefficients)
    print("\nFeature Impact (Standardized Coefficients):")
    for col, coef in zip(feature_cols, model.coef_):
        print(f"  - {col:<15}: {coef:>8.2f}")

    # Sample Predictions Comparison
    comparison = pd.DataFrame({
        "Product": test_df["Product"].values[:10],
        "ActualUnits": y_test.values[:10],
        "PredictedUnits": np.round(y_pred[:10]).astype(int),
        "Error": (np.round(y_pred[:10]) - y_test.values[:10]).astype(int)
    })
    print("\nSample Forecast Comparison (Unseen Future Months):")
    print(comparison)

    # =========================================================================
    # 5. Save Artifacts for Prediction Service
    # =========================================================================
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "demand_model.pkl")
    scaler_path = os.path.join("models", "scaler.pkl")
    metrics_path = os.path.join("models", "model_metrics.json")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    metrics_data = {
        "model_type": "LinearRegression",
        "features": feature_cols,
        "target": target_col,
        "mae_units": round(float(mae), 2),
        "rmse_units": round(float(rmse), 2),
        "r2_score": round(float(r2), 4),
        "mape_percent": round(float(mape), 2),
        "train_samples": len(X_train),
        "test_samples": len(X_test)
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print("\n" + "=" * 60)
    print(f"Model saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    print(f"Metrics saved to: {metrics_path}")
    print("=" * 60)

if __name__ == "__main__":
    train_and_evaluate()
