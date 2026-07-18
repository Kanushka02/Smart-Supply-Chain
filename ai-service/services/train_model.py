import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("data/clean_supply_chain.csv")

print(df.head())

X = df[["Price", "Stock", "Orders"]]
y = df["FutureDemand"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)