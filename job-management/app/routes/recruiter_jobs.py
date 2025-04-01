# recruiter_jobs.py
from app.schemas.application import ApplicationUpdateStatus, ApplicationOut
from app.models.application import Application
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.schemas.recruiter_view import JobWithApplicationsResponse
from app.models.application import ApplicationStatus
from app.models.job import Job
from app.database.database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import joinedload


router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter View"]
)


@router.put(
    "/applications/{application_id}/status",
    response_model=ApplicationOut
)
def update_application_status(
    application_id: int,
    status_update: ApplicationUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403, detail="Only recruiters can update status."
        )

    application = db.query(Application).filter(
        Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = status_update.status
    db.commit()
    db.refresh(application)
    return application


@router.get("/jobs/{job_id}", response_model=JobWithApplicationsResponse)
def get_job_with_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    print("🧠 Recruiter Job route hit")
    print(f"Current User Role: {current_user.role}")  # Debug: Print user role
    print(f"Attempting to retrieve job ID: {job_id}")  # Debug: Log the job ID

    if current_user.role != "recruiter":
        # Debug: Check if this condition is met
        print("❌ User is NOT a recruiter - Unauthorized")
        raise HTTPException(status_code=401, detail="Unauthorized")

    job = db.query(Job)\
        .options(joinedload(Job.applications))\
        .filter(Job.id == job_id)\
        .first()

    if job:
        print(f"✅ Job ID {job_id} found")  # Debug: Confirm job is found
    else:
        # Debug: Confirm job is NOT found
        print(f"❌ Job ID {job_id} not found")
        raise HTTPException(status_code=404, detail="Job not found")

    accepted, rejected, not_reviewed = [], [], []

    for app in job.applications:
        if app.status == ApplicationStatus.accepted:
            accepted.append(app)
        elif app.status == ApplicationStatus.rejected:
            rejected.append(app)
        else:
            not_reviewed.append(app)

    return {
        "job": job,
        "accepted": accepted,
        "rejected": rejected,
        "not_reviewed": not_reviewed
    }
