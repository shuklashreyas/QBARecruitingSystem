# file: main.py
from app.routes.recruiter_jobs import router as recruiter_router
from app.routes.auth import router as auth_router
from app.routes.jobs import router as job_router
from app.routes.user import router as user_router
from fastapi import FastAPI, Depends, UploadFile, Form
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from app.routes import application

from PyPDF2 import PdfReader
from transformers import BertModel
from torch.nn.functional import normalize
import torch
import pickle


load_dotenv()

# Import routers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Define OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Register routers
# Register routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(job_router, prefix="/jobs", tags=["Jobs"])
app.include_router(recruiter_router)
app.include_router(application.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


class UserLogin(BaseModel):
    username: str
    password: str


@app.get("/secure-jobs")
def get_jobs(token: str = Depends(oauth2_scheme)):
    return {"message": "This is a protected job list"}


@app.get("/")
def home():
    return {"message": "Job Management API is running"}


# test message
bert_tokenizer = pickle.load(
    open("resume_scoring_ai/bert_model/bert_tokenizer.pkl", "rb")
)

classifier = pickle.load(
    open("resume_scoring_ai/bert_model/classifier.pkl", "rb")
)

bert_model = BertModel.from_pretrained(
    "resume_scoring_ai/bert_model"
).to("cpu")


def get_bert_embedding(text):
    inputs = bert_tokenizer(text, return_tensors="pt",
                            truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = bert_model(**inputs)
    cls_embedding = outputs.last_hidden_state[:, 0, :]
    return normalize(cls_embedding, p=2, dim=1).cpu().numpy()[0]


@app.post("/score-resume-pdf")
async def score_resume_pdf(file: UploadFile, job_text: str = Form(...)):
    reader = PdfReader(file.file)
    resume_text = "\n".join(
        [page.extract_text() or "" for page in reader.pages])

    combined_text = resume_text + " [SEP] " + job_text
    embedding = get_bert_embedding(combined_text)
    print("Embedding dim:", len(embedding))
    print("Classifier expects:", classifier.coef_.shape)
    score = classifier.predict_proba(
        [embedding])[0][1]  # probability of class 1

    return {"score": round(score, 4)}
