from app.models.user import User
from app.database.database import get_db
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status


# Define credentials_exception
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# Secret key (should be stored in environment variables)
SECRET_KEY = os.getenv("SECRET_KEY", "your_default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify if a plain password matches a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    to_encode.update({"type": "access"})  # <-- ADD THIS LINE
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("🔍 Payload contents:", payload)
        if payload.get("type") != "access":
            print("❌ Token type is not 'access'")
            return None
        return payload
    except JWTError as e:
        print("❌ JWT Decode Error:", e)
        return None


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_refresh_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT refresh token (longer expiration, with type refresh)."""
    refresh_exp = expires_delta if expires_delta else timedelta(days=7)
    to_encode = data.copy()
    expire = datetime.utcnow() + refresh_exp
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    try:
        print("📥 Raw token received:", token)

        payload = decode_access_token(token)
        print("✅ Token successfully decoded:", payload)

        if payload is None:
            print("❌ Token payload is None (invalid token)")
            raise credentials_exception

        if "sub" not in payload:
            print("❌ 'sub' missing in token payload")
            raise credentials_exception

        username = payload["sub"]
        print("🔍 Looking up user in DB with username:", username)

        # Add debugging here
        all_users = db.query(User).all()
        print("🧪 Users in DB:", [(u.id, u.username, u.role)
              for u in all_users])

        user = db.query(User).filter(User.username == username).first()

        if user is None:
            print("❌ No user found for username:", username)
            raise credentials_exception

        print("✅ User found in DB:", user.username, "| role:", user.role)
        return user
    except Exception as e:
        print("🔥 Unexpected error in get_current_user:", repr(e))
        raise credentials_exception
