from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from deps.deps import get_current_user
from models import KanbanStage, Project, Task, User
from schemas.tasks import TaskCreate, TaskResponse, TaskStageUpdate, TaskUpdate

router = APIRouter(prefix="/api", tags=["Tasks"])


def _is_staff(user: User) -> bool:
    return user.role in ("admin", "manager")


def _can_manage_project(user: User, project: Project) -> bool:
    return _is_staff(user) or project.owner_id == user.id


def _can_manage_task(user: User, task: Task) -> bool:
    if _is_staff(user):
        return True
    return task.assignee_id == user.id or task.created_by_id == user.id


@router.post("/create_task", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == task_data.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not _can_manage_project(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    stage = (
        db.query(KanbanStage)
        .filter(
            KanbanStage.id == task_data.stage_id,
            KanbanStage.project_id == project.id,
        )
        .first()
    )
    if not stage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stage not found in this project",
        )

    assignee = db.query(User).filter(User.id == task_data.assignee_id).first()
    if not assignee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignee not found")

    now = datetime.now(timezone.utc)
    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        project_id=project.id,
        stage_id=stage.id,
        assignee_id=assignee.id,
        created_by_id=current_user.id,
        created_at=now,
        updated_at=now,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks", response_model=list[TaskResponse])
def list_tasks(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)

    if project_id is not None:
        query = query.filter(Task.project_id == project_id)

    if not _is_staff(current_user):
        query = query.filter(
            (Task.assignee_id == current_user.id) | (Task.created_by_id == current_user.id)
        )

    return query.order_by(Task.id).all()


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if not _can_manage_task(current_user, task):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    return task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if not _can_manage_task(current_user, task):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.priority is not None:
        task.priority = data.priority

    if data.stage_id is not None:
        stage = (
            db.query(KanbanStage)
            .filter(
                KanbanStage.id == data.stage_id,
                KanbanStage.project_id == task.project_id,
            )
            .first()
        )
        if not stage:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stage not found in this project",
            )
        task.stage_id = stage.id

    if data.assignee_id is not None:
        assignee = db.query(User).filter(User.id == data.assignee_id).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignee not found",
            )
        task.assignee_id = assignee.id

    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if not _can_manage_task(current_user, task):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    db.delete(task)
    db.commit()
    return None


@router.patch("/tasks/{task_id}/stage", response_model=TaskResponse)
def move_task_stage(
    task_id: int,
    data: TaskStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if not _can_manage_task(current_user, task):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    stage = (
        db.query(KanbanStage)
        .filter(
            KanbanStage.id == data.stage_id,
            KanbanStage.project_id == task.project_id,
        )
        .first()
    )
    if not stage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stage not found in this project",
        )

    task.stage_id = stage.id
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task
