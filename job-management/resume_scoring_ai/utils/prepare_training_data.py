import json
import re
import random
import pandas as pd

input_file = "Preprocessed_Data.txt"

# ✅ Load real job descriptions
with open("data/job_descriptions.json", "r") as f:
    job_desc_map = json.load(f)


def clean_text(text):
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


def flatten_jd(jd_obj):
    if isinstance(jd_obj, dict):
        parts = []
        for val in jd_obj.values():
            if isinstance(val, list):
                parts.extend(val)
            else:
                parts.append(val)
        return " ".join(parts)
    return jd_obj


# Read resumes
data = []
with open(input_file, "r", encoding="utf-8") as f:
    next(f)  # skip header
    for line in f:
        try:
            category, text = line.strip().split(",", 1)
            if category not in job_desc_map:
                continue
            data.append((category.strip(), clean_text(text)))
        except ValueError:
            continue

df = pd.DataFrame(data, columns=["category", "resume"])

# Build pairs
positive_data = []
negative_data = []

for idx, row in df.iterrows():
    correct_category = row["category"]
    correct_jd_raw = flatten_jd(job_desc_map[correct_category])
    correct_job = clean_text(correct_jd_raw)

    # Positive
    positive_data.append({
        "resume": row["resume"],
        "job": correct_job,
        "label": 1
    })

    # Negative
    wrong_categories = list(set(job_desc_map.keys()) - {correct_category})
    wrong_cat = random.choice(wrong_categories)
    wrong_jd_raw = flatten_jd(job_desc_map[wrong_cat])
    wrong_job = clean_text(wrong_jd_raw)

    negative_data.append({
        "resume": row["resume"],
        "job": wrong_job,
        "label": 0
    })

# Shuffle & save
combined = positive_data + negative_data
random.shuffle(combined)

with open("data/combined_texts.json", "w") as f:
    json.dump(combined, f, indent=2)

print(f"✅ Created {len(combined)} resume-job training pairs.")
