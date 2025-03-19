from pydantic import BaseModel
from typing import Optional


class JobBase(BaseModel):
    title: str
    description: str                    # Short job description for listings
    # Long job paragraph for job details page
    detailed_description: Optional[str] = None
    company: str
    in_person_mode: Optional[str] = None
    compensation: Optional[str] = None
    location: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    detailed_description: Optional[str] = None
    company: Optional[str] = None
    in_person_mode: Optional[str] = None
    compensation: Optional[str] = None
    location: Optional[str] = None


class JobResponse(JobBase):
    id: int
    owner_id: Optional[int] = None
    detailed_description: Optional[str] = None

    class Config:
        from_attributes = True
