"""
Data Preprocessing & Feature Engineering for Demand Forecasting.
Engineers realistic time-series features without data leakage:
- Target (y): NextMonthOrders (t+1)
- Features (X): Current Price, Current Stock, Current Orders (t), Lag-1 Orders (t-1), Rolling 3-Month Mean Orders, and Month Seasonality.
"""

import os
import json
import pandas as pd
import numpy as np

def preprocess_data():
    raw_path = os.path.join("data", "supply_chain.csv")
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Source file {raw_path} not found. Run generate_dataset.py first.")

    df = pd.read_csv(raw_path)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(by=["Product", "Date"]).reset_index(drop=True)

    print("Engineering time-series features...")

    # 1. Target: Next Month's Orders (t + 1)
    df["NextMonthOrders"] = df.groupby("Product")["Orders"].shift(-1)

    # 2. Lag-1 Orders: Previous month's orders (t - 1)
    df["Lag1Orders"] = df.groupby("Product")["Orders"].shift(1)
    # Fill first lag with current orders to avoid losing initial data points
    df["Lag1Orders"] = df["Lag1Orders"].fillna(df["Orders"])

    # 3. Rolling 3-Month Average of past orders (using only past data up to t)
    df["RollingMean3"] = (
        df.groupby("Product")["Orders"]
        .transform(lambda s: s.rolling(window=3, min_periods=1).mean().round(2))
    )

    # Drop the final month of each product (since we don't have NextMonthOrders for the future)
    clean_df = df.dropna(subset=["NextMonthOrders"]).copy()
    clean_df["NextMonthOrders"] = clean_df["NextMonthOrders"].astype(int)

    # Define feature list for model training & API serving
    feature_columns = ["Price", "Stock", "Orders", "Lag1Orders", "RollingMean3", "Month"]
    target_column = "NextMonthOrders"

    # Save cleaned dataset
    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)

    clean_path = os.path.join("data", "clean_supply_chain.csv")
    clean_df.to_csv(clean_path, index=False)

    # Save feature metadata so the prediction API knows exact feature names and order
    metadata = {
        "feature_columns": feature_columns,
        "target_column": target_column,
        "products": sorted(clean_df["Product"].unique().tolist()),
        "total_records": len(clean_df)
    }

    metadata_path = os.path.join("models", "feature_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Clean dataset saved to: {clean_path}")
    print(f"Total modeling records: {len(clean_df)}")
    print(f"Feature metadata saved to: {metadata_path}")
    print("\nSample engineered records:")
    print(clean_df[["Date", "Product"] + feature_columns + [target_column]].head(6))

    return clean_df

if __name__ == "__main__":
    preprocess_data()
