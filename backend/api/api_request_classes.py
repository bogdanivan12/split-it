from datetime import datetime
from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, Field, EmailStr

from backend.common import models


class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, min_length=5,
                                      max_length=50)
    full_name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, min_length=9,
                                        max_length=15)
    revolut_id: Optional[str] = Field(None, min_length=5, max_length=20)


class CreateGroupRequest(BaseModel):
    name: str = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100, default="")


class UpdateGroupRequest(BaseModel):
    name: Optional[str] = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100)
    owner_id: Optional[PydanticObjectId] = Field(default=None)
    member_ids: Optional[List[PydanticObjectId]] = Field(default_factory=list)
    bill_ids: Optional[List[PydanticObjectId]] = Field(default_factory=list)


class InviteToGroupRequest(BaseModel):
    username: str = Field(min_length=5, max_length=20)
    group_id: PydanticObjectId


class InviteToGroupRequestBulk(BaseModel):
    group_id: PydanticObjectId
    usernames: List[str]


class CreateBillRequest(BaseModel):
    bill_type: models.BillType = models.BillType.SPLIT_BY_MEMBERS
    group_id: Optional[PydanticObjectId] = Field(default=None)
    name: str = Field(min_length=5, max_length=30)
    description: str = Field(max_length=100, default="")
    initial_payers: Optional[List[models.Payer]] = Field(default_factory=list)
    date: datetime = Field(default_factory=datetime.now)
    payer_ids: Optional[List[models.Payer]] = Field(default_factory=list)
    products: Optional[List[models.Product]] = Field(default_factory=list)

    class Config:
        json_encoders = {PydanticObjectId: str}
