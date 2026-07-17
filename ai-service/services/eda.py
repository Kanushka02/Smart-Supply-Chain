import pandas as pd

# Load dataset
df = pd.read_csv("data/supply_chain.csv")

# Show first 5 rows
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