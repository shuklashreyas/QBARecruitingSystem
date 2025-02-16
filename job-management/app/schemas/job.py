from pydantic import BaseModel
from typing import Optional

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    company: Optional[str] = None

class JobBase(BaseModel):
    title: str
    description: str
    company: str

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    owner_id: Optional[int] = None  # Allow None for old jobs without an owner

    class Config:
        from_attributes = True  # 🔹 Replaces `orm_mode = True` in Pydantic v2
