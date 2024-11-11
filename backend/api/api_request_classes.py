from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from typing import Optional, List


class CreateGroupRequest(BaseModel):
    name: str = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100, default="")


class UpdateGroupRequest(BaseModel):
    name: Optional[str] = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100)
    owner_id: Optional[PydanticObjectId] = Field(default=None)
    member_ids: Optional[List[PydanticObjectId]] = Field(default_factory=list)
    bill_ids: Optional[List[PydanticObjectId]] = Field(default_factory=list)
