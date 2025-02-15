from sqlalchemy import Column, Integer, String, Index
from app.database.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    company = Column(String, nullable=False)

# Add index for fast searching
Index("idx_jobs_title", Job.title)
