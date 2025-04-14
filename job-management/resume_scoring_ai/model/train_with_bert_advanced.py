import pickle
import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from transformers import BertTokenizer, BertModel
import torch
from torch.nn.functional import normalize
from tqdm import tqdm

# Load training data
with open("data/combined_texts.json", "r") as f:
    combined = json.load(f)
y = [item["label"] for item in combined]  # ✅ Use labels from JSON

# Load tokenizer and model
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertModel.from_pretrained("bert-base-uncased")
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# BERT embedding extractor


def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt",
                       truncation=True, padding=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
    cls_vec = outputs.last_hidden_state[:, 0, :]  # CLS token
    return normalize(cls_vec, p=2, dim=1).squeeze().cpu().numpy()

# Rich feature generator


def build_features(resume_text, job_text):
    e1 = get_embedding(resume_text)
    e2 = get_embedding(job_text)

    cosine_sim = np.dot(e1, e2) / (np.linalg.norm(e1)
                                   * np.linalg.norm(e2) + 1e-8)
    diff = np.abs(e1 - e2)
    product = e1 * e2

    return np.concatenate([[cosine_sim], diff, product])


# Build features
print("🔄 Encoding texts with BERT...")
X = []
for item in tqdm(combined):
    X.append(build_features(item["resume"], item["job"]))
X = np.array(X)

# Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

# Train model
print("🧠 Training classifier...")
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

# Evaluate
print("📊 Evaluation:")
y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))

# Save
with open("saved_model/classifier.pkl", "wb") as f:
    pickle.dump(clf, f)
with open("saved_model/bert_tokenizer.pkl", "wb") as f:
    pickle.dump(tokenizer, f)
model.save_pretrained("saved_model/bert_model")

print("✅ Done!")
