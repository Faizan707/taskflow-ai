from pydantic import BaseModel, ConfigDict


class StageCreate(BaseModel):
    name: str


class StageResponse(BaseModel):
    id: int
    name: str
    position: int
    project_id: int

    model_config = ConfigDict(from_attributes=True)
