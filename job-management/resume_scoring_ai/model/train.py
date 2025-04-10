import pickle
import json
import pandas as pd
from tensorflow.keras import layers, models
from preprocess import get_vectorized_data

# Load pre-generated data
print("📦 Loading and preprocessing data...")
with open("data/combined_texts.json", "r") as f:
    data = json.load(f)

texts = [item["resume"] + " [SEP] " + item["job"] for item in data]
labels = pd.read_csv("data/scores.csv")["score"].values

X_train, X_test, y_train, y_test, vectorizer = get_vectorized_data(
    texts, labels)

# Build model
print("🧠 Building the enhanced model...")
model = models.Sequential([
    layers.Input(shape=(X_train.shape[1],)),
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.4),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(1, activation="sigmoid")
])

model.compile(optimizer="adam", loss="mean_squared_error", metrics=["mae"])

# Train
print("🚀 Training...")
model.fit(X_train, y_train, epochs=20, batch_size=32)

# Evaluate
print("📊 Evaluating...")
loss, mae = model.evaluate(X_test, y_test)
print(f"Test MAE: {mae:.4f}")

# Save model & vectorizer
print("💾 Saving model and vectorizer...")
model.save("saved_model/resume_matcher.h5")
with open("saved_model/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✅ Done!")
