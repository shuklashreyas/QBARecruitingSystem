from fastapi import APIRouter

router = APIRouter()


@router.get("/jobs")
def get_jobs():
    return {"message": "List of jobs"}


@router.post("/jobs")
def create_job():
    return {"message": "Job created successfully"}
