import pickle
from tensorflow.keras import layers, models
from preprocess import load_and_prepare_data, get_vectorized_data

# Paths to your datasets
resume_path = "../data/synthetic_resumes.json"
job_path = "../data/synthetic_jobs.json"
label_path = "../data/synthetic_labels.csv"

# 1. Load and preprocess data
print("📦 Loading and preprocessing data...")
texts, labels = load_and_prepare_data(resume_path, job_path, label_path)
X_train, X_test, y_train, y_test, vectorizer = get_vectorized_data(
    texts, labels)

# 2. Define a simple feedforward neural network
print("🧠 Building the model...")
model = models.Sequential([
    layers.Input(shape=(X_train.shape[1],)),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(64, activation="relu"),
    layers.Dense(1, activation="sigmoid")  # Output score between 0 and 1
])

model.compile(optimizer="adam", loss="mean_squared_error", metrics=["mae"])

# 3. Train the model
print("🚀 Training...")
model.fit(X_train, y_train, epochs=10, batch_size=32)

# 4. Evaluate the model
print("📊 Evaluating...")
loss, mae = model.evaluate(X_test, y_test)
print(f"Test MAE: {mae:.4f}")

# 5. Save the model + vectorizer
print("💾 Saving model and vectorizer...")
model.save("saved_model/resume_matcher.h5")

with open("saved_model/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✅ Done!")
