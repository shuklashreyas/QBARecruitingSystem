from pydantic import BaseModel, EmailStr
from enum import Enum


class UserBase(BaseModel):
    username: str
    email: str


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    username: str


class UserRole(str, Enum):
    admin = "admin"
    recruiter = "recruiter"
    applicant = "applicant"


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole
    name: str

    class Config:
        schema_extra = {
            "example": {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123",
                "role": "recruiter",
                "name": "New User"
            }
        }
