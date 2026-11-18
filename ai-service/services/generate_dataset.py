"""
Dataset Generator for Smart Supply Chain Management System.
Generates realistic multi-year historical monthly sales data across 5 spice products.
Includes seasonality (holiday spikes in Q4), baseline demand, price elasticity, and realistic inventory levels.
"""

import os
import numpy as np
import pandas as pd

def generate_historical_data():
    np.random.seed(42)  # For reproducible results

    products = [
        {"name": "Cinnamon Powder", "base_price": 500, "base_orders": 200, "seasonality_strength": 1.35},
        {"name": "Black Pepper", "base_price": 720, "base_orders": 160, "seasonality_strength": 1.25},
        {"name": "Cardamom", "base_price": 1250, "base_orders": 90, "seasonality_strength": 1.40},
        {"name": "Cloves", "base_price": 880, "base_orders": 110, "seasonality_strength": 1.30},
        {"name": "Turmeric", "base_price": 380, "base_orders": 260, "seasonality_strength": 1.20},
    ]

    # 36 months: Jan 2023 to Dec 2025
    date_range = pd.date_range(start="2023-01-01", end="2025-12-01", freq="MS")

    rows = []

    for p in products:
        name = p["name"]
        base_price = p["base_price"]
        base_orders = p["base_orders"]
        seasonality = p["seasonality_strength"]

        stock = int(base_orders * 1.5)  # initial healthy stock

        for i, dt in enumerate(date_range):
            month = dt.month
            year = dt.year

            # Year-over-year annual trend growth (~5% per year)
            year_factor = 1.0 + (year - 2023) * 0.06

            # Seasonal index: higher in Q4 (Oct, Nov, Dec festivals/holidays), dip in mid-year (June, July)
            seasonal_pattern = np.sin((month - 3) * (2 * np.pi / 12)) * 0.15 + 1.0
            if month in [10, 11, 12]:
                seasonal_pattern *= seasonality

            # Monthly random variance (+/- 8%)
            noise = np.random.normal(1.0, 0.05)

            # Price fluctuations (+/- 3% over time)
            price_variation = np.random.normal(0, 0.02)
            current_price = round(base_price * (1 + price_variation * 0.5 + (year - 2023) * 0.03), 2)

            # Price elasticity effect: higher price slightly reduces demand
            elasticity_factor = 1.0 - 0.2 * ((current_price - base_price) / base_price)

            # Calculate units ordered
            expected_orders = base_orders * year_factor * seasonal_pattern * elasticity_factor * noise
            orders = max(10, int(round(expected_orders)))

            # Stock updates: regular restocking + variance
            restock = int(orders * np.random.uniform(0.9, 1.25))
            stock = max(15, stock - orders + restock)

            rows.append({
                "Date": dt.strftime("%Y-%m-%d"),
                "Year": year,
                "Month": month,
                "Product": name,
                "Price": current_price,
                "Stock": stock,
                "Orders": orders
            })

    df = pd.DataFrame(rows)

    # Sort chronologically and by product
    df = df.sort_values(by=["Product", "Date"]).reset_index(drop=True)

    os.makedirs("data", exist_ok=True)
    output_path = os.path.join("data", "supply_chain.csv")
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} rows across {len(products)} products into {output_path}")
    print(df.head(10))

if __name__ == "__main__":
    generate_historical_data()
