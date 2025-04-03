# file: main.py
from app.routes.recruiter_jobs import router as recruiter_router
from app.routes.auth import router as auth_router
from app.routes.jobs import router as job_router
from app.routes.user import router as user_router
from fastapi import FastAPI, Depends
from app.auth.auth import (
    oauth2_scheme
)
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from app.routes import application
from fastapi.staticfiles import StaticFiles

load_dotenv()

# Import routers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
