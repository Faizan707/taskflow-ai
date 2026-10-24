from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from models.projects import Project
    from models.stages import KanbanStage
    from models.users import User


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, default="")
    # low | medium | high — default medium for new and existing rows
    priority: Mapped[str] = mapped_column(String, default="medium", server_default="medium")
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    stage_id: Mapped[int] = mapped_column(ForeignKey("kanban_stages.id"), nullable=False)
    assignee_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)

    project: Mapped[Project] = relationship("Project", back_populates="tasks")
    stage: Mapped[KanbanStage] = relationship("KanbanStage", back_populates="tasks")
    assignee: Mapped[User] = relationship(
        "User",
        foreign_keys=[assignee_id],
        back_populates="assigned_tasks",
    )
    created_by: Mapped[User] = relationship(
        "User",
        foreign_keys=[created_by_id],
        back_populates="created_tasks",
    )
