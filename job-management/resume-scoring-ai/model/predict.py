import pickle
import numpy as np
from tensorflow.keras.models import load_model
from preprocess import clean_text, combine_text
from sklearn.feature_extraction.text import TfidfVectorizer

print("📦 Loading model and vectorizer...")
model = load_model("saved_model/resume_matcher.h5")

with open("saved_model/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# 👇 Replace with your test inputs
resume_text = """
Experienced software engineer with a focus on backend development, REST APIs, and cloud infrastructure.
"""
job_desc_text = """
Looking for a backend engineer skilled in Python, RESTful API design, and AWS infrastructure.
"""

print("📄 Vectorizing new input...")
combined = combine_text(clean_text(resume_text), clean_text(job_desc_text))
X = vectorizer.transform([combined]).toarray()

score = model.predict(X)[0][0]
print(f"🧠 Resume Compatibility Score: {score:.2f}")
