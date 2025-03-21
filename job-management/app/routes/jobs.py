from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.database import get_db
from app.auth.auth import get_current_user
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.models.job import Job

router = APIRouter()


@router.post("", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_job = Job(**job.dict(), owner_id=current_user.id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.get("", response_model=list[JobResponse])
def get_jobs(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    title: Optional[str] = Query(None, min_length=0),  # Allow empty string
    company: Optional[str] = Query(None, min_length=0),  # Allow empty string
    # You can add a posted_date filter if your Job model has a created_at field
):
    query = db.query(Job)
    if title:
        query = query.filter(Job.title.ilike(f"%{title}%"))
    if company:
        query = query.filter(Job.company.ilike(f"%{company}%"))
    jobs = query.offset(offset).limit(limit).all()
    return jobs


@router.get("/mine", response_model=list[JobResponse])
def get_my_jobs(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Job).filter(Job.owner_id == current_user.id).all()


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Allow recruiters to edit any job; otherwise, ensure they own the job.
    if current_user.role != "recruiter" and job.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this job")

    for key, value in job_update.dict(exclude_unset=True).items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", response_model=dict)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id,
                               Job.owner_id == current_user.id).first()

    if not job:
        raise HTTPException(
            status_code=404, detail="Job not found or not authorized to delete")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
