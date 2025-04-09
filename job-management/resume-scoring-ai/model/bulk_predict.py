import pickle
import pandas as pd
from tensorflow.keras.models import load_model
from preprocess import clean_text
from tqdm import tqdm

# Load model + vectorizer
print("📦 Loading model and vectorizer...")
model = load_model("saved_model/resume_matcher.h5")
with open("saved_model/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Load combined resume-job pairs
print("📂 Loading combined resume-job pairs...")
combined = pd.read_json("data/combined_texts.json")

results = []

print("🔍 Predicting scores...")
for idx, row in tqdm(combined.iterrows(), total=len(combined)):
    resume_text = clean_text(row["resume"])
    job_text = clean_text(row["job"])
    combined_text = f"{resume_text} [SEP] {job_text}"
    vectorized = vectorizer.transform([combined_text]).toarray()
    score = float(model.predict(vectorized, verbose=0)[0][0])

    results.append({
        "resume": resume_text[:80] + "...",
        "job": job_text[:80] + "...",
        "score": round(score, 4)
    })

# Save to CSV
df = pd.DataFrame(results)
df.to_csv("bulk_predictions.csv", index=False)
print("✅ Saved scores to bulk_predictions.csv")
