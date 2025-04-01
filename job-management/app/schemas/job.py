from typing import Optional
from pydantic import BaseModel


class JobBase(BaseModel):
    title: str
    description: str
    detailed_description: Optional[str] = None
    in_person_mode: Optional[str] = None
    compensation: Optional[str] = None
    location: Optional[str] = None
    job_posted: Optional[str] = None
    job_expiration: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    in_person_mode: Optional[str] = None
    compensation: Optional[str] = None
    location: Optional[str] = None
    job_posted: Optional[str] = None
    job_expiration: Optional[str] = None


class JobResponse(JobBase):
    id: int

    class Config:
        from_attributes = True
