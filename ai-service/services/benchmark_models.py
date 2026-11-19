"""
Multi-Model Demand Forecasting Benchmark Suite.
Compares Linear Regression, Ridge, Lasso, Random Forest, and Gradient Boosting
on an identical chronological time-series split.
Evaluates R², MAE, RMSE, MAPE, training time, and inference latency.
Exports results to models/benchmark_report.json.
"""

import os
import time
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def run_benchmark():
    clean_path = os.path.join("data", "clean_supply_chain.csv")
    if not os.path.exists(clean_path):
        # Fallback if executing from root or different relative dir
        clean_path = os.path.join("ai-service", "data", "clean_supply_chain.csv")
    if not os.path.exists(clean_path):
        raise FileNotFoundError(f"Clean data not found at {clean_path}. Run preprocessing.py first.")

    df = pd.read_csv(clean_path)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(by="Date").reset_index(drop=True)

    feature_cols = ["Price", "Stock", "Orders", "Lag1Orders", "RollingMean3", "Month"]
    target_col = "NextMonthOrders"

    # =========================================================================
    # 1. Chronological Split (Train: 80% earlier, Test: 20% future)
    # =========================================================================
    split_date = df["Date"].quantile(0.80)
    train_df = df[df["Date"] <= split_date]
    test_df = df[df["Date"] > split_date]

    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Models under benchmark
    models = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0, random_state=42),
        "Lasso Regression": Lasso(alpha=0.5, random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42)
    }

    benchmark_results = []

    print("=" * 80)
    print("STARTING MACHINE LEARNING MODEL BENCHMARK (TIME-SERIES DEMAND FORECASTING)")
    print("=" * 80)
    print(f"Dataset: {len(df)} total rows | Features: {len(feature_cols)} | Test Split: {len(X_test)} samples (chronological)")
    print("-" * 80)

    champion_model_name = None
    lowest_mae = float("inf")
    champion_instance = None

    for name, model in models.items():
        # Measure training duration
        t0 = time.perf_counter()
        model.fit(X_train_scaled, y_train)
        train_time_ms = round((time.perf_counter() - t0) * 1000, 2)

        # Measure inference latency (100 repetitions on single sample)
        sample = X_test_scaled[:1]
        t_inf0 = time.perf_counter()
        for _ in range(100):
            model.predict(sample)
        inf_latency_ms = round(((time.perf_counter() - t_inf0) / 100) * 1000, 4)

        # Evaluate on unseen test set
        y_pred = model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

        result = {
            "model_name": name,
            "r2_score": round(float(r2), 4),
            "mae_units": round(float(mae), 2),
            "rmse_units": round(float(rmse), 2),
            "mape_percent": round(float(mape), 2),
            "train_time_ms": train_time_ms,
            "inference_latency_ms": inf_latency_ms
        }
        benchmark_results.append(result)

        print(f"[{name:<20}]  R²: {r2:0.4f} | MAE: {mae:>5.2f} units | RMSE: {rmse:>5.2f} | Train: {train_time_ms:>6.2f} ms | Latency: {inf_latency_ms:>6.4f} ms")

        if mae < lowest_mae:
            lowest_mae = mae
            champion_model_name = name
            champion_instance = model

    # Sort results by lowest MAE
    benchmark_results.sort(key=lambda x: x["mae_units"])

    print("=" * 80)
    print(f"CHAMPION MODEL: {champion_model_name} (Lowest MAE: {lowest_mae:.2f} units)")
    print("=" * 80)

    # Save benchmark report to models/benchmark_report.json
    models_dir = "models" if os.path.exists("models") else os.path.join("ai-service", "models")
    os.makedirs(models_dir, exist_ok=True)
    report_path = os.path.join(models_dir, "benchmark_report.json")

    report_payload = {
        "generated_at": datetime.now().isoformat(),
        "champion_model": champion_model_name,
        "features": feature_cols,
        "target": target_col,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "rankings": benchmark_results
    }

    with open(report_path, "w") as f:
        json.dump(report_payload, f, indent=2)

    print(f"Benchmark report saved to: {report_path}")
    return report_payload

if __name__ == "__main__":
    run_benchmark()
