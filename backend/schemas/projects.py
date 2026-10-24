from pydantic import BaseModel, ConfigDict

from schemas.stages import StageResponse


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    owner_id: int
    stages: list[StageResponse] = []

    model_config = ConfigDict(from_attributes=True)
