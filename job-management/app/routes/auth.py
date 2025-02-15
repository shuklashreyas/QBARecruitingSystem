from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext  # 🔹 Added missing import

from app.auth.auth import authenticate_user, create_access_token
from app.crud.user import create_user
from app.database.database import get_db
from app.schemas.user import UserCreate
from pydantic import BaseModel

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Register a New User
@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    if create_user(db, user):
        return {"message": "User created successfully"}
    raise HTTPException(status_code=400, detail="User already exists")

# Generate Access Token (OAuth2)
@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)  # 🔹 Removed `await`
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}

# User Login (Basic)
class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    return {"message": "Login successful"}
