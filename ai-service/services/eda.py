import os
import pandas as pd

def run_eda():
    data_path = os.path.join("data", "supply_chain.csv")
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Run generate_dataset.py first.")
        return

    df = pd.read_csv(data_path)

    print("=" * 60)
    print("EXPLORATORY DATA ANALYSIS (EDA) - SUPPLY CHAIN DATASET")
    print("=" * 60)

    print("\n1. Dataset Shape & Overview:")
    print(f"Total Rows: {len(df)}, Total Columns: {len(df.columns)}")
    print(df.head(5))

    print("\n2. Column Data Types & Non-Null Counts:")
    print(df.info())

    print("\n3. Missing Values Check:")
    missing = df.isnull().sum()
    print(missing[missing > 0] if missing.sum() > 0 else "No missing values found! (Clean dataset)")

    print("\n4. Duplicates Check:")
    print(f"Duplicate rows count: {df.duplicated().sum()}")

    print("\n5. Summary Statistics by Product:")
    summary = df.groupby("Product").agg(
        record_count=("Orders", "count"),
        avg_price=("Price", "mean"),
        min_orders=("Orders", "min"),
        avg_orders=("Orders", "mean"),
        max_orders=("Orders", "max"),
        avg_stock=("Stock", "mean")
    ).round(2)
    print(summary)

    print("\n6. Overall Numerical Summary:")
    print(df[["Price", "Stock", "Orders"]].describe().round(2))

    print("\n7. Correlation Matrix (Numeric Features):")
    numeric_cols = ["Year", "Month", "Price", "Stock", "Orders"]
    corr = df[numeric_cols].corr().round(3)
    print(corr)

    print("\n" + "=" * 60)
    print("EDA Complete! Dataset is ready for feature engineering.")
    print("=" * 60)

if __name__ == "__main__":
    run_eda()
