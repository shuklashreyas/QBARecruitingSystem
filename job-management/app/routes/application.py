from datetime import datetime
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    Path,
)
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.application import Application
from app.auth.auth import get_current_user
import shutil
import os
from app.models.user import User
from pydantic import BaseModel
from app.models.job import Job


class StatusUpdate(BaseModel):
    status: str


class ApplicationSummary(BaseModel):
    id: int
    job_id: int
    job_title: str
    created_at: Optional[datetime]
    status: str


router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/applications")
def create_application(
    job_id: int = Form(...),
    responses: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check for existing application
    existing = db.query(Application).filter_by(
        user_id=current_user.id, job_id=job_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="You already applied to this job."
        )

    # Save resume file
    resume_path = os.path.join(
        UPLOAD_DIR, f"user_{current_user.id}_job_{job_id}_{resume.filename}")
    with open(resume_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    # Store resume path in responses for now (or use a separate column later)
    import json
    responses_dict = json.loads(responses)
    responses_dict["resume"] = resume_path

    new_app = Application(
        user_id=current_user.id,
        job_id=job_id,
        responses=responses_dict,
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {
        "message": "Application submitted successfully",
        "application_id": new_app.id,
    }


@router.get("/applications/mine", response_model=List[ApplicationSummary])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    apps = db.query(Application).filter(
        Application.user_id == current_user.id).all()
    summaries = []

    for app in apps:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        job_title = job.title if job else "Unknown Job"
        summaries.append(ApplicationSummary(
            id=app.id,
            job_id=app.job_id,
            job_title=job_title,
            created_at=app.created_at,
            status=app.status.value
        ))

    return summaries


@router.get("/applications/{application_id}")
def get_application_detail(
    application_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    application = db.query(Application).filter(
        Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Not authorized")

    user = db.query(User).filter(User.id == application.user_id).first()

    # 🧠 Add this to fetch the related job
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Related job not found")

    return {
        "id": application.id,
        "user_id": application.user_id,
        "user_name": user.name if user else None,
        "responses": application.responses,
        "resume_url": application.resume_url,
        "status": application.status.value,
        "job": {
            "id": job.id,
            "title": job.title,
            "description": job.detailed_description,
        }
    }


@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    application = db.query(Application).filter(
        Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = payload.status
    db.commit()
    db.refresh(application)
    return {"message": f"Status updated to {payload.status}"}
