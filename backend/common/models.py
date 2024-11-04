from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class User(BaseModel):
    id: str
    username: str
    password_hash: str
    email: str
    full_name: str = ""
    revolut_id: Optional[str] = None
    group_ids: List[str] = []


class Group(BaseModel):
    id: str
    name: str
    description: str = ""
    owner_id: str
    member_ids: List[str] = []
    bill_ids: List[str] = []


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


class Payment(BaseModel):
    id: str
    bill_id: str
    amount: float
    payer_id: str
    recipient_id: str
    date: datetime
    method: str = "not selected"  # e.g., "cash", "revolut" etc.
    status: str = "not started"  # e.g., "in progress", "completed" etc.
