from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from deps.deps import get_current_user
from models import KanbanStage, Project, User
from schemas.projects import ProjectCreate, ProjectResponse, ProjectUpdate
from schemas.stages import StageCreate, StageResponse

router = APIRouter(prefix="/api", tags=["Projects"])

DEFAULT_STAGES = ["todo", "inprogress", "done"]


def _get_project_or_404(db: Session, project_id: int) -> Project:
    project = (
        db.query(Project)
        .options(joinedload(Project.stages))
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _is_staff(user: User) -> bool:
    return user.role in ("admin", "manager")


def _can_manage_project(user: User, project: Project) -> bool:
    return _is_staff(user) or project.owner_id == user.id


@router.post("/projects", response_model=ProjectResponse, status_code=201)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    project = Project(
        name=data.name,
        description=data.description,
        owner_id=current_user.id,
        created_at=now,
        updated_at=now,
    )
    db.add(project)
    db.flush()

    for index, stage_name in enumerate(DEFAULT_STAGES):
        db.add(
            KanbanStage(
                name=stage_name,
                position=index,
                project_id=project.id,
            )
        )

    db.commit()
    return _get_project_or_404(db, project.id)


@router.get("/projects", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project).options(joinedload(Project.stages))
    if not _is_staff(current_user):
        query = query.filter(Project.owner_id == current_user.id)
    return query.order_by(Project.id).all()


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    if not _can_manage_project(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return project


@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    if not _can_manage_project(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if data.name is not None:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    project.updated_at = datetime.now(timezone.utc)

    db.commit()
    return _get_project_or_404(db, project.id)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    if not _can_manage_project(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    db.delete(project)
    db.commit()
    return None


@router.post(
    "/projects/{project_id}/stages",
    response_model=StageResponse,
    status_code=201,
)
def add_stage(
    project_id: int,
    data: StageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    if not _can_manage_project(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    max_position = max((s.position for s in project.stages), default=-1)
    stage = KanbanStage(
        name=data.name,
        position=max_position + 1,
        project_id=project.id,
    )
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage
