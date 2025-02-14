from fastapi import FastAPI
from app.crud.job import router as job_router

app = FastAPI()

# Include the job router
app.include_router(job_router)


@app.get("/")
def home():
    return {"message": "Job Management API is running"}
