from typing import List
from pydantic import BaseModel
from app.schemas.job import JobResponse
from app.schemas.application import ApplicationOut


class JobWithApplicationsResponse(BaseModel):
    job: JobResponse
    accepted: List[ApplicationOut]
    rejected: List[ApplicationOut]
    not_reviewed: List[ApplicationOut]

    class Config:
        from_attributes = True
