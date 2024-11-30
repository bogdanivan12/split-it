from beanie import PydanticObjectId
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional


class User(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    username: str = Field(min_length=5, max_length=20)
    email: EmailStr = Field(min_length=5, max_length=50)
    full_name: Optional[str] = Field(max_length=50, default="")
    phone_number: Optional[str] = Field(min_length=9, max_length=15,
                                        default=None)
    revolut_id: Optional[str] = Field(min_length=5, max_length=20,
                                      default=None)
    group_ids: List[PydanticObjectId] = Field(default_factory=list)

    class Config:
        json_encoders = {PydanticObjectId: str}


class UserInDB(User):
    hashed_password: str


class UserSummary(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    username: str
    full_name: Optional[str]

class IsUserInGroup(BaseModel):
    in_group: bool
    has_request: bool


class Group(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100, default="")
    owner_id: Optional[PydanticObjectId] = Field(default=None)
    member_ids: List[PydanticObjectId] = Field(default_factory=list)
    bill_ids: Optional[List[PydanticObjectId]] = Field(default_factory=list)
    join_code: Optional[str] = Field(min_length=4, max_length=20, default=None)

    class Config:
        json_encoders = {PydanticObjectId: str}

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


class InitialPayer(BaseModel):
    user_id: str
    amount: float


class Product(BaseModel):
    name: str
    price: float
    quantity: int = 1
    assigned_payer_ids: List[str] = []


class Bill(BaseModel):
    id: str
    owner_id: str
    group_id: str
    name: str
    description: str = ""
    initial_payers: List[InitialPayer] = []
    amount: float
    date: datetime
    # if member_ids is None, the bill is split by products
    member_ids: Optional[List[str]] = []
    # if products is None, the bill is split evenly by members
    products: Optional[List[Product]] = None
    payment_ids: List[str] = []


class PaymentMethod(str, Enum):
    NOT_SELECTED = "NOT_SELECTED"
    CASH = "CASH"
    REVOLUT = "REVOLUT"


class PaymentStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class Payment(BaseModel):
    id: str
    bill_id: str
    amount: float
    payer_id: str
    recipient_id: str
    date: datetime
    method: PaymentMethod = PaymentMethod.NOT_SELECTED
    status: PaymentStatus = PaymentStatus.NOT_STARTED


class RequestStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"


class RequestType(str, Enum):
    JOIN_GROUP = "JOIN_GROUP"
    INVITE_TO_GROUP = "INVITE_TO_GROUP"
    JOIN_MINIGAME = "JOIN_MINIGAME"
    INVITE_TO_MINIGAME = "INVITE_TO_MINIGAME"


class Request(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    group_id: PydanticObjectId
    sender_id: PydanticObjectId
    sender: Optional[UserSummary] = None
    recipient: Optional[UserSummary] = None
    recipient_id: PydanticObjectId
    date: datetime = Field(default_factory=datetime.now)
    type: RequestType = RequestType.JOIN_GROUP
    status: RequestStatus = RequestStatus.PENDING

    class Config:
        json_encoders = {PydanticObjectId: str}


class FullInfoRequest(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    group_id: PydanticObjectId
    sender: UserSummary
    recipient: UserSummary
    date: datetime = Field(default_factory=datetime.now)
    type: RequestType = RequestType.JOIN_GROUP
    status: RequestStatus = RequestStatus.PENDING

    class Config:
        json_encoders = {PydanticObjectId: str}

class Token(BaseModel):
    access_token: str
    token_type: str = "Bearer"
