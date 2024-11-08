from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class User(BaseModel):
    id: str
    username: str
    password_hash: str
    email: str
    full_name: str = ""
    phone_number: Optional[str] = None
    revolut_id: Optional[str] = None
    group_ids: List[str] = []


class Group(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str = Field(min_length=5, max_length=30)
    description: Optional[str] = Field(max_length=100, default="")
    owner_id: Optional[PyObjectId] = Field(alias="owner_id", default=None)
    member_ids: List[str] = Field(default_factory=list)
    bill_ids: Optional[List[str]] = Field(default_factory=list)


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


class PaymentMethod(Enum):
    NOT_SELECTED = "NOT_SELECTED"
    CASH = "CASH"
    REVOLUT = "REVOLUT"


class PaymentStatus(Enum):
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


class RequestStatus(Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"


class RequestType(Enum):
    JOIN_GROUP = "JOIN_GROUP"
    JOIN_MINIGAME = "JOIN_MINIGAME"


class Request(BaseModel):
    id: str
    group_id: str
    sender_id: str
    recipient_id: str
    date: datetime
    type: RequestType
    status: RequestStatus = RequestStatus.PENDING
