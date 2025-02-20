from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.auth.auth import create_access_token, verify_password, get_password_hash, oauth2_scheme
from pydantic import BaseModel
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.routes.user import router as user_router
from app.routes.jobs import router as job_router
from app.routes.auth import router as auth_router 

app = FastAPI()

# Register routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(job_router, prefix="/jobs", tags=["Jobs"])

# Fake user for testing (Replace this with actual DB authentication)
fake_users_db = {
    "admin": {"username": "admin", "password": get_password_hash("admin123")}
}

class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": form_data.username}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/secure-jobs")
def get_jobs(token: str = Depends(oauth2_scheme)):
    return {"message": "This is a protected job list"}

@app.get("/")
def home():
    return {"message": "Job Management API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or use ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)