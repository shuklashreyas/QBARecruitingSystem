from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.application import Application
from app.schemas.application import ApplicationStatusUpdate

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


@router.put("/{application_id}/status")
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = status_update.status
    db.commit()
    db.refresh(application)
    return {"message": "Status updated", "application_id": application.id, "new_status": application.status}
