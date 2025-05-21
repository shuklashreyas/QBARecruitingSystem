# file: main.py

from fastapi import FastAPI, Depends, UploadFile, Form
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from transformers import BertModel
from torch.nn.functional import normalize
from PyPDF2 import PdfReader
from app.routes.recruiter_jobs import router as recruiter_router
from app.routes.auth import router as auth_router
from app.routes.jobs import router as job_router
from app.routes.user import router as user_router
from app.routes import application
from app.routes.resume_parser import router as resume_parser_router

import pickle
import numpy as np
import torch
from io import BytesIO

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 token scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Register routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(job_router, prefix="/jobs", tags=["Jobs"])
app.include_router(recruiter_router)
app.include_router(application.router)
app.include_router(
    resume_parser_router, prefix="/resume-parser", tags=["Resume Parser"])

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


class UserLogin(BaseModel):
    username: str
    password: str


@app.get("/")
def home():
    return {"message": "Job Management API is running"}


@app.get("/secure-jobs")
def get_jobs(token: str = Depends(oauth2_scheme)):
    return {"message": "This is a protected job list"}


# Load AI components
bert_tokenizer = pickle.load(
    open("app/resume_scoring_ai/saved_model/bert_tokenizer.pkl", "rb"))
classifier = pickle.load(
    open("app/resume_scoring_ai/saved_model/classifier.pkl", "rb"))
bert_model = BertModel.from_pretrained(
    "app/resume_scoring_ai/saved_model/bert_model").to("cpu")
bert_model.eval()


def get_embedding(text: str) -> np.ndarray:
    inputs = bert_tokenizer(text, return_tensors="pt",
                            truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = bert_model(**inputs)
    cls_vec = outputs.last_hidden_state[:, 0, :]
    return normalize(cls_vec, p=2, dim=1).squeeze().cpu().numpy()


def build_features(resume_text: str, job_text: str) -> np.ndarray:
    e1 = get_embedding(resume_text)
    e2 = get_embedding(job_text)
    cosine_sim = np.dot(e1, e2) / (np.linalg.norm(e1)
                                   * np.linalg.norm(e2) + 1e-8)
    diff = np.abs(e1 - e2)
    product = e1 * e2
    return np.concatenate([[cosine_sim], diff, product])


@app.post("/score-resume-pdf")
async def score_resume_pdf(file: UploadFile, job_text: str = Form(...)):
    try:
        contents = await file.read()
        reader = PdfReader(BytesIO(contents))
        resume_text = "\n".join(
            [page.extract_text() or "" for page in reader.pages])
    except Exception as e:
        return {"error": f"Failed to process PDF: {str(e)}"}

    features = build_features(resume_text, job_text)
    print("Feature vector shape:", features.shape)
    print("Classifier expects:", classifier.coef_.shape)

    try:
        score = classifier.predict_proba([features])[0][1]
        return {"score": round(score, 4)}
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}
