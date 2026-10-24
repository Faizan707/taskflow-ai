from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from deps.deps import get_current_admin, get_current_user
from models import User
from schemas.users import UserCreate, UserResponse, UserRoleUpdate
from security.security import get_password_hash

router = APIRouter(prefix="/api", tags=["users"])


@router.post("/create-users", response_model=UserResponse, status_code=201)
def create_users(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.now(timezone.utc)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=get_password_hash(user_data.password),
        role="user",
        created_at=now,
        updated_at=now,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return db.query(User).order_by(User.id).all()


@router.get("/assignees", response_model=list[UserResponse])
def list_assignees(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Any logged-in user can list people to assign tasks to (including self)."""
    return db.query(User).order_by(User.id).all()


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot change their own role",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.role = role_data.role
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user
