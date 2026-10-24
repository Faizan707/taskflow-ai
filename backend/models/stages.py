from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

if TYPE_CHECKING:
    from models.projects import Project
    from models.tasks import Task


class KanbanStage(Base):
    __tablename__ = "kanban_stages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    position: Mapped[int] = mapped_column(Integer, default=0)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)

    project: Mapped[Project] = relationship("Project", back_populates="stages")
    tasks: Mapped[list[Task]] = relationship("Task", back_populates="stage")
