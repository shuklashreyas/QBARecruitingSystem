import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

# Clean the text (basic)


def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# Combine resume and job description into a single input


def combine_text(resume, job_desc):
    return f"{resume} [SEP] {job_desc}"

# Load and preprocess your dataset for training


def load_and_prepare_data(resume_path, job_path, label_path):
    resumes = pd.read_json(resume_path)
    jobs = pd.read_json(job_path)
    labels = pd.read_csv(label_path)

    assert len(resumes) == len(jobs) == len(labels), "Mismatch in data length."

    combined_texts = []
    for i in range(len(resumes)):
        resume = clean_text(resumes.iloc[i]["text"])
        job = clean_text(jobs.iloc[i]["text"])
        combined = combine_text(resume, job)
        combined_texts.append(combined)

    y = labels["score"].values  # Should be between 0 and 1
    return combined_texts, y

# Vectorize + split for training


def get_vectorized_data(texts, y=None, vectorizer=None):
    if isinstance(texts, str):
        texts = [texts]  # Make it a list if it's a single string

    if vectorizer is None:
        vectorizer = TfidfVectorizer(max_features=5000)
        X = vectorizer.fit_transform(texts).toarray()
    else:
        X = vectorizer.transform(texts).toarray()

    if y is not None:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        return X_train, X_test, y_train, y_test, vectorizer
    else:
        return X, vectorizer
