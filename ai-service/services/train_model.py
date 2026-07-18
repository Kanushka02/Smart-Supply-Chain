import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

# ----------------------------
# Load Dataset
# ----------------------------

df = pd.read_csv("data/clean_supply_chain.csv")

print(df.head())

# ----------------------------
# Features (Inputs)
# ----------------------------

X = df[["Price", "Stock", "DemandRatio"]]

# ----------------------------
# Target (Output)
# ----------------------------

y = df["Orders"]

# ----------------------------
# Split Dataset
# ----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# ----------------------------
# Create Model
# ----------------------------

model = LinearRegression()

# ----------------------------
# Train Model
# ----------------------------

model.fit(X_train, y_train)

# ----------------------------
# Predict
# ----------------------------

predictions = model.predict(X_test)

# ----------------------------
# Evaluate
# ----------------------------

mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("\nModel Performance")
print("------------------")
print("MAE :", mae)
print("R²  :", r2)

# ----------------------------
# Save Model
# ----------------------------

joblib.dump(model, "models/demand_model.pkl")

print("\nModel saved successfully!")

# ----------------------------
# Load Model
# ----------------------------

loaded_model = joblib.load("models/demand_model.pkl")

# Example prediction
sample = pd.DataFrame({
    "Price": [-1.0],
    "Stock": [0.5],
    "DemandRatio": [0.8]
})

prediction = loaded_model.predict(sample)

print(prediction)