# app/routes/application.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.application import Application
from app.auth.auth import get_current_user
from app.schemas.application import ApplicationCreate
import json

router = APIRouter()


@router.post("/applications")
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_app = Application(
        job_id=application.job_id,
        user_id=current_user.id,
        status="not_reviewed",
        responses=json.dumps(application.responses)
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return {"message": "Application submitted successfully"}
