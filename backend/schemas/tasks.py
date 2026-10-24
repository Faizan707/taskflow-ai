from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator

TaskPriority = Literal["low", "medium", "high"]
ALLOWED_PRIORITIES = {"low", "medium", "high"}


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    project_id: int
    stage_id: int
    assignee_id: int
    priority: TaskPriority = "medium"

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in ALLOWED_PRIORITIES:
            raise ValueError("priority must be low, medium, or high")
        return normalized


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    stage_id: int | None = None
    assignee_id: int | None = None
    priority: TaskPriority | None = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip().lower()
        if normalized not in ALLOWED_PRIORITIES:
            raise ValueError("priority must be low, medium, or high")
        return normalized


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: TaskPriority
    project_id: int
    stage_id: int
    assignee_id: int
    created_by_id: int

    model_config = ConfigDict(from_attributes=True)


class TaskStageUpdate(BaseModel):
    stage_id: int
