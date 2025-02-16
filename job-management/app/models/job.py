from sqlalchemy import Column, Integer, String, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    company = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))  # 🔹 Add this

    owner = relationship("User")  # 🔹 Link job to user

# Add index for fast searching
Index("idx_jobs_title", Job.title)
