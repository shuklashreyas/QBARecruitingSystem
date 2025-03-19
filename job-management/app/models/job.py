from sqlalchemy import Column, Integer, String, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)  # Job ID
    title = Column(String, nullable=False)              # Job Name
    in_person_mode = Column(String, nullable=True)        # In Person/Hybrid
    description = Column(String, nullable=False)          # Job Description
    detailed_description = Column(String, nullable=True)
    company = Column(String, nullable=False)              # Company Name
    compensation = Column(String, nullable=True)          # Compensation
    location = Column(String, nullable=True)              # Location
    owner_id = Column(Integer, ForeignKey("users.id"))      # Owner (Recruiter)

    owner = relationship("User")


Index("idx_jobs_title", Job.title)
