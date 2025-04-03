# job-management/app/crud/job.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.job import Job
from pydantic import BaseModel
from app.models.application import Application
from app.auth.auth import get_current_user

router = APIRouter()

# Job Schema with validation


class JobCreate(BaseModel):
    title: str
    description: str
    company: str

# CREATE a new job


@router.post("/jobs")
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    new_job = Job(title=job.title, description=job.description,
                  company=job.company)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

# READ all jobs


@router.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

# READ a single job by ID


@router.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job_data = job.__dict__

    if current_user.role == "recruiter":
        apps = db.query(Application).filter(Application.job_id == job_id).all()
        # Group by status:
        job_data["accepted"] = [
            a.__dict__ for a in apps if a.status == "accepted"]
        job_data["rejected"] = [
            a.__dict__ for a in apps if a.status == "rejected"]
        job_data["not_reviewed"] = [
            a.__dict__ for a in apps if a.status == "not_reviewed"]

    return job_data


# UPDATE a job


@router.put("/jobs/{job_id}")
def update_job(
    job_id: int, job_update: JobCreate, db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in job_update.dict().items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job

# DELETE a job


@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
