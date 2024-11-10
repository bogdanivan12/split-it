from pydantic import BaseModel, Field
from typing import Optional


class CreateGroupRequest(BaseModel):
    name: str = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100, default="")


class JoinGroupRequest(BaseModel):
    join_code: str = Field(min_length=6, max_length=10)
