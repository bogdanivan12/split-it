from enum import Enum
from datetime import datetime
from typing import List, Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field, EmailStr


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


class Payer(BaseModel):
    user_id: Optional[PydanticObjectId] = Field(default=None)
    amount: float = Field(gt=0)

    class Config:
        json_encoders = {PydanticObjectId: str}


class Product(BaseModel):
    name: str = Field(min_length=1, max_length=30)
    total_price: float = Field(gt=0)
    quantity: int = Field(gt=0, default=1)
    assigned_payers: List[Payer] = Field(default_factory=list)

    class Config:
        json_encoders = {PydanticObjectId: str}


class BillType(str, Enum):
    SPLIT_BY_MEMBERS = "SPLIT_BY_MEMBERS"
    SPLIT_BY_PRODUCTS = "SPLIT_BY_PRODUCTS"


class Bill(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    bill_type: BillType = BillType.SPLIT_BY_MEMBERS
    owner_id: Optional[PydanticObjectId] = Field(default=None)
    group_id: Optional[PydanticObjectId] = Field(default=None)
    name: str = Field(min_length=5, max_length=30)
    description: str = Field(max_length=100, default="")
    initial_payers: Optional[List[Payer]] = Field(default_factory=list)
    date: datetime = Field(default_factory=datetime.now)
    payer_ids: Optional[List[Payer]] = Field(default_factory=list)
    products: Optional[List[Product]] = Field(default_factory=list)
    payment_ids: List[PydanticObjectId] = Field(default_factory=list)

    class Config:
        json_encoders = {PydanticObjectId: str}


class PaymentMethod(str, Enum):
    NOT_SELECTED = "NOT_SELECTED"
    CASH = "CASH"
    REVOLUT = "REVOLUT"


class PaymentStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class Payment(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    bill_id: Optional[PydanticObjectId] = Field(default=None)
    amount: float = Field(gt=0)
    payer_id: Optional[PydanticObjectId] = Field(default=None)
    recipient_id: Optional[PydanticObjectId] = Field(default=None)
    date: datetime = Field(default_factory=datetime.now)
    method: PaymentMethod = Field(default=PaymentMethod.NOT_SELECTED)
    status: PaymentStatus = Field(default=PaymentStatus.NOT_STARTED)


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
    recipient_id: PydanticObjectId
    date: datetime = Field(default_factory=datetime.now)
    type: RequestType = RequestType.JOIN_GROUP
    status: RequestStatus = RequestStatus.PENDING

    class Config:
        json_encoders = {PydanticObjectId: str}


class Token(BaseModel):
    access_token: str
    token_type: str = "Bearer"
