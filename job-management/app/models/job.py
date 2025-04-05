from typing import Any, Dict, Optional
from sqlalchemy import JSON, Column, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import relationship
from app.database.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    detailed_description = Column(Text)
    in_person_mode = Column(String)
    compensation = Column(String)
    location = Column(String)
    job_posted = Column(String)
    job_expiration = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    other_materials = Column(JSON, default=[])  # ✅ THIS LINE FIXES IT
    job_questions = Column(JSON, default=[])
    url_descriptions = Column(JSON, default=[])

    applications = relationship(
        "Application", back_populates="job", cascade="all, delete"
    )


# Index to speed up search by job title
Index("idx_jobs_title", Job.title)
