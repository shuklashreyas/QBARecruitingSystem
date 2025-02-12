from fastapi import FastAPI
from app.routes import jobs

app = FastAPI()

app.include_router(jobs.router)

@app.get("/")
def home():
    return {"message": "Job Management API is running"}
