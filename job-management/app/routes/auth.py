from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.auth.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    oauth2_scheme
)
from app.crud.user import create_user
from app.database.database import get_db
from app.schemas.user import UserCreate

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Register User


@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    if create_user(db, user):
        return {"message": "User created successfully"}
    raise HTTPException(status_code=400, detail="User already exists")

# Login and Generate JWT Token


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=timedelta(minutes=30)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role  # <-- Add the user's role here
    }


@router.post("/refresh", response_model=dict)
def refresh_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_access_token = create_access_token(
        data={"sub": payload.get("sub")}, expires_delta=timedelta(minutes=30))
    return {"access_token": new_access_token, "token_type": "bearer"}
