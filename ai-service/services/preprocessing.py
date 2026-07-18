import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

# =====================================
# Load Dataset
# =====================================

df = pd.read_csv("data/supply_chain.csv")

print("First 5 Rows")
print(df.head())

# =====================================
# Dataset Information
# =====================================

print("\nDataset Info")
print(df.info())

print("\nMissing Values")
print(df.isnull().sum())

# =====================================
# Remove Duplicates
# =====================================

df = df.drop_duplicates()

print("\nDuplicates:", df.duplicated().sum())

# =====================================
# Encode Month
# =====================================

month_encoder = LabelEncoder()

df["Month"] = month_encoder.fit_transform(df["Month"])

# =====================================
# Encode Product
# =====================================

product_encoder = LabelEncoder()

df["Product"] = product_encoder.fit_transform(df["Product"])

# =====================================
# Feature Engineering
# =====================================

df["InventoryValue"] = df["Stock"] * df["Price"]

df["DemandRatio"] = df["Orders"] / df["Stock"]

# =====================================
# Scale Numeric Columns
# =====================================

scaler = StandardScaler()

columns = ["Orders", "Stock", "Price"]

df[columns] = scaler.fit_transform(df[columns])

# =====================================
# Save Clean Dataset
# =====================================

df.to_csv(
    "data/clean_supply_chain.csv",
    index=False
)

print("\n✅ Preprocessing Completed Successfully!")

print(df.head())