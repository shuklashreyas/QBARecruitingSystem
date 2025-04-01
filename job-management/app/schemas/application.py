from pydantic import BaseModel
from enum import Enum
from app.models.application import ApplicationStatus


class ApplicationStatusEnum(str, Enum):
    accepted = "accepted"
    rejected = "rejected"
    not_reviewed = "not_reviewed"


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: ApplicationStatusEnum

    class Config:
        from_attributes = True


class ApplicationUpdateStatus(BaseModel):
    status: ApplicationStatusEnum


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
