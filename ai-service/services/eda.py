import pandas as pd
import matplotlib.pyplot as plt

# Load dataset
df = pd.read_csv("data/supply_chain.csv")

print("First 5 rows:")
print(df.head())

print("\nDataset info:")
print(df.info())

print("\nStatistics:")
print(df.describe())

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:")
print(df.duplicated().sum())

# -------------------------
# Sales Trend Visualization
# -------------------------

plt.figure(figsize=(10, 5))

plt.plot(df["Month"], df["Orders"], marker="o")

plt.title("Monthly Orders Trend")

plt.xlabel("Month")

plt.ylabel("Orders")

plt.grid(True)

plt.show()