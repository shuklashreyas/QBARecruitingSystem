# File: app/routes/jobs.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.database import get_db
from app.auth.auth import get_current_user
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.models.job import Job
from app.models.application import Application
from datetime import datetime
from app.models.user import User


router = APIRouter()


@router.post("", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    data = job.dict()

    data["job_questions"] = data.get("job_questions", [])
    data["url_descriptions"] = data.get("url_descriptions", [])

    # Fallback to today's date if job_posted isn't explicitly given
    if not data.get("job_posted"):
        data["job_posted"] = datetime.utcnow().strftime("%Y-%m-%d")

    new_job = Job(**data, owner_id=current_user.id)

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
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
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
    # Only recruiters can delete jobs
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403, detail="Not authorized to delete jobs")

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}


@router.get("/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job_data = {
    "id": job.id,
    "title": job.title,
    "description": job.description,
    "detailed_description": job.detailed_description,
    "in_person_mode": job.in_person_mode,
    "compensation": job.compensation,
    "location": job.location,
    "job_posted": job.job_posted,
    "job_expiration": job.job_expiration,
    "other_materials": job.other_materials,
    "job_questions": job.job_questions,
    "url_descriptions": job.url_descriptions
}
    print("Serving job data:", job_data)

    applications = db.query(Application).filter(
        Application.job_id == job_id).all()

    # ✅ Applied status
    has_applied = any(app.user_id == current_user.id for app in applications)
    job_data["has_applied"] = has_applied

    if current_user.role == "recruiter":
        grouped = {
            "accepted": [],
            "rejected": [],
            "not_reviewed": []
        }
        for app in applications:
            user = db.query(User).filter(User.id == app.user_id).first()
            user_name = user.name if user else f"User {app.user_id}"
            grouped[app.status.value].append({
                "id": app.id,
                "user_id": app.user_id,
                "user_name": user_name,  # ✅ Include user_name here
                "responses": app.responses,
                "status": app.status.value
            })
        job_data["applications"] = grouped
    else:
        job_data["applications"] = [
            {
                "id": app.id,
                "user_id": app.user_id,
                "responses": app.responses,
                "status": app.status.value
            }
            for app in applications
        ]

    return job_data
