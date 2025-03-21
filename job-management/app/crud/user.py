from sqlalchemy.orm import Session
from app.models.user import User
from app.auth.auth import get_password_hash
from app.schemas.user import UserCreate


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, user: UserCreate):
    # Use the role provided in the user input, don't override it with a default unless necessary
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=user.role  # Make sure this line exists
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
