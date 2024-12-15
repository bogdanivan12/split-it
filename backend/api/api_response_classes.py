from typing import List
from pydantic import BaseModel
from beanie import PydanticObjectId
from typing import List, Optional

from backend.common import models
from datetime import datetime
from pydantic import BaseModel, Field
from backend.common.models import RequestType, RequestStatus


class UserSummary(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    username: str
    full_name: Optional[str]

    class Config:
        json_encoders = {PydanticObjectId: str}


class IsUserInGroup(BaseModel):
    in_group: bool
    has_request: bool


class FullInfoGroup(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100, default="")
    owner_id: Optional[PydanticObjectId] = Field(default=None)
    members: List[UserSummary] = Field(default_factory=list)
    bill_ids: Optional[List[PydanticObjectId]] = Field(default_factory=list)
    join_code: Optional[str] = Field(min_length=4, max_length=20, default=None)

    class Config:
        json_encoders = {PydanticObjectId: str}


class GroupSummary(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str = Field(min_length=5, max_length=30)

    class Config:
        json_encoders = {PydanticObjectId: str}


class FullInfoRequest(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    group_id: Optional[PydanticObjectId] = None
    group: Optional[GroupSummary] = None
    sender: Optional[UserSummary] = None
    recipient: Optional[UserSummary] = None
    sender_id: Optional[PydanticObjectId] = None
    recipient_id: Optional[PydanticObjectId] = None
    date: datetime = Field(default_factory=datetime.now)
    type: RequestType = RequestType.JOIN_GROUP
    status: RequestStatus = RequestStatus.PENDING


class GetRequestsResponseForStatus(BaseModel):
    sent: List[FullInfoRequest]
    received: List[FullInfoRequest]

    class Config:
        json_encoders = {PydanticObjectId: str}


class FullInfoPayer(models.Payer):
    user: UserSummary


class FullInfoProduct(models.Product):
    assigned_payers_info: List[FullInfoPayer]


class FullInfoBill(models.Bill):
    owner: UserSummary
    group: GroupSummary
    initial_payers_info: List[FullInfoPayer]
    payers_info: Optional[List[FullInfoPayer]] = None
    products_info: Optional[List[FullInfoProduct]] = None
