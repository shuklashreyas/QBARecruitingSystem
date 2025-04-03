from sqlalchemy import Column, Integer, ForeignKey, Enum, String
from sqlalchemy.orm import relationship
from app.database.database import Base
from enum import Enum as PyEnum
from sqlalchemy.dialects.postgresql import JSON


class ApplicationStatus(PyEnum):
    accepted = "accepted"
    rejected = "rejected"
    not_reviewed = "not_reviewed"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(Enum(ApplicationStatus),
                    default=ApplicationStatus.not_reviewed)
    responses = Column(JSON, nullable=False)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    resume_url = Column(String, nullable=True)
