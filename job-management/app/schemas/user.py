from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    username: str
    email: str


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    username: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str 