import pandas as pd
import random
from generate_jobs import generate_jobs

# Load resumes
df = pd.read_csv("hf://datasets/brackozi/Resume/UpdatedResumeDataSet.csv")
resumes = df["Resume"].tolist()
resume_categories = df["Category"].tolist()

# Generate jobs
jobs = generate_jobs(n=100)

# Match resumes to jobs + generate scores
pairs = []
scores = []

for resume_text, category in zip(resumes, resume_categories):
    job = random.choice(jobs)
    job_category = job["category"]

    # Assign score based on category match
    if category.lower() in job_category.lower():
        score = round(random.uniform(0.7, 1.0), 2)
    elif (
        category.lower() in ["business", "operations", "hr"]
        and job_category.lower() in [
            "business & operations", "human resources"
        ]
    ):
        score = round(random.uniform(0.5, 0.7), 2)
    else:
        score = round(random.uniform(0.2, 0.5), 2)

    pairs.append({
        "resume": resume_text,
        "job": job["description"],
    })
    scores.append(score)

# Save to disk
print("💾 Saving combined data...")
pd.DataFrame(pairs).to_json(
    "data/combined_texts.json", orient="records", indent=2)
pd.DataFrame({"score": scores}).to_csv("data/scores.csv", index=False)
print("✅ Saved resume-job pairs and scores.")
