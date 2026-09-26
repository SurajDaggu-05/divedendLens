from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, AuthResponseData

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email address is already registered.",
        )
    
    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at,
            },
            "access_token": token,
            "token_type": "bearer",
            "expires_in_seconds": 1800,
        }
    }


@router.post("/login")
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(user.id)
    return {
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at,
            },
            "access_token": token,
            "token_type": "bearer",
            "expires_in_seconds": 1800,
        }
    }


@router.post("/logout")
def logout_user(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "message": "Successfully logged out."
        }
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at,
        }
    }
