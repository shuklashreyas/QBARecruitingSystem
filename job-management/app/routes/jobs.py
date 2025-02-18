from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.auth.auth import get_current_user
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.models.job import Job

router = APIRouter()

@router.post("", response_model=JobResponse)  # ✅ Allow requests without a trailing slash
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

@router.get("", response_model=list[JobResponse])  # ✅ Allow requests without a trailing slash
def get_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

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

    if job.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")

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
    job = db.query(Job).filter(Job.id == job_id, Job.owner_id == current_user.id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not authorized to delete")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
