import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

# Clean and combine


def combine_text(resume, job_desc):
    return f"{resume} [SEP] {job_desc}"


def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def get_vectorized_data(texts, y):
    cleaned = [clean_text(t) for t in texts]
    vectorizer = TfidfVectorizer(max_features=7000)
    X = vectorizer.fit_transform(cleaned).toarray()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    return X_train, X_test, y_train, y_test, vectorizer
