from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_strict_current_user,
)
from app.schemas.auth import UserRegisterRequest, UserLoginRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory rate limiting dictionary for failed login attempts
# normalized_email -> {"failed_attempts": int, "locked_until": datetime}
FAILED_ATTEMPTS: Dict[str, Dict[str, Any]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 5


def check_rate_limit(normalized_email: str):
    now = datetime.now(timezone.utc)
    record = FAILED_ATTEMPTS.get(normalized_email)
    if record:
        locked_until = record.get("locked_until")
        if locked_until:
            if now < locked_until:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many unsuccessful attempts. Please wait a few minutes before trying again.",
                )
            else:
                # Lock expired
                FAILED_ATTEMPTS.pop(normalized_email, None)


def record_failed_attempt(normalized_email: str):
    now = datetime.now(timezone.utc)
    record = FAILED_ATTEMPTS.get(normalized_email, {"failed_attempts": 0, "locked_until": None})
    record["failed_attempts"] += 1
    if record["failed_attempts"] >= MAX_FAILED_ATTEMPTS:
        record["locked_until"] = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    FAILED_ATTEMPTS[normalized_email] = record


def clear_failed_attempts(normalized_email: str):
    FAILED_ATTEMPTS.pop(normalized_email, None)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    normalized_email = req.email.strip().lower()

    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters long.",
        )

    existing = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in.",
        )

    user = User(
        name=req.name.strip(),
        email=normalized_email,
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
    normalized_email = req.email.strip().lower()

    # Rate limiting & lockout check
    check_rate_limit(normalized_email)

    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()

    if not user or not verify_password(req.password, user.password_hash):
        record_failed_attempt(normalized_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Clear failed attempt counter on successful login
    clear_failed_attempts(normalized_email)

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
def logout_user(current_user: User = Depends(get_strict_current_user)):
    return {
        "success": True,
        "data": {
            "message": "Successfully logged out."
        }
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_strict_current_user)):
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at,
        }
    }
