import math

from starlette import status
from beanie import PydanticObjectId
from typing import Dict, Union, Annotated, List
from fastapi import APIRouter, Depends, HTTPException

from backend.api import users
from backend.common import models
from backend.common import config_info
from backend.api import api_response_classes as api_resp

db = config_info.get_db()
router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


def initialize_total_amounts(
        bill: models.Bill
) -> Dict[str, Union[float, Dict[PydanticObjectId, float]]]:
    amounts_to_pay = {}
    if bill.bill_type == models.BillType.SPLIT_BY_MEMBERS:
        for payer in bill.payers:
            if payer.user_id not in amounts_to_pay:
                amounts_to_pay[payer.user_id] = 0
            amounts_to_pay[payer.user_id] += payer.amount
        print(f"{amounts_to_pay = }")
    elif bill.bill_type == models.BillType.SPLIT_BY_PRODUCTS:
        for product in bill.products:
            for payer in product.assigned_payers:
                if payer.user_id not in amounts_to_pay:
                    amounts_to_pay[payer.user_id] = 0
                amounts_to_pay[payer.user_id] += payer.amount
        print(f"{amounts_to_pay = }")

    total_amount = 0
    amounts_to_receive = {}
    for initial_payer in bill.initial_payers:
        user_id = initial_payer.user_id
        amount = initial_payer.amount
        if (user_id in amounts_to_pay
                and amount >= amounts_to_pay[user_id]):
            amount -= amounts_to_pay[user_id]
            amounts_to_pay.pop(user_id, None)
        elif (user_id in amounts_to_pay
              and amount < amounts_to_pay[user_id]):
            amounts_to_pay[user_id] -= amount
            amount = 0
        if amount > 0:
            amounts_to_receive[user_id] = amount
            total_amount += amount

    print(f"{amounts_to_receive = }")

    amounts_to_pay = {
        user_id: amount
        for user_id, amount in amounts_to_pay.items()
        if amount > 0
    }
    amounts_to_receive = {
        user_id: amount
        for user_id, amount in amounts_to_receive.items()
        if amount > 0
    }
    response = {
        "total_amount": total_amount,
        "amounts_to_pay": amounts_to_pay,
        "amounts_to_receive": amounts_to_receive
    }
    return response


def create_payments(bill: models.Bill):
    """
    # Create payments
    This function creates payments for a bill.
    """
    initialization = initialize_total_amounts(bill)
    print(initialization)
    total_amount = initialization["total_amount"]
    amounts_to_pay = initialization["amounts_to_pay"]
    amounts_to_receive = initialization["amounts_to_receive"]

    payments = []
    for payer, amount_to_pay in amounts_to_pay.items():
        for recipient, initial_payed_amount in amounts_to_receive.items():
            percentage = initial_payed_amount / total_amount
            amount = math.ceil(amount_to_pay * percentage * 100) / 100
            if amount < 0:
                raise ValueError("Amount to be paid cannot be negative")
            payment = models.Payment(
                bill_id=bill.id,
                amount=amount,
                payer_id=payer,
                recipient_id=recipient
            )
            payment_dict = payment.model_dump(by_alias=True)
            payment_dict.pop("_id", None)
            payments.append(payment_dict)
    print(payments)
    if not payments:
        return []

    db_result = db["payments"].insert_many(payments)
    return db_result.inserted_ids


@router.get("/{payment_id}", status_code=200,
            response_model=api_resp.FullInfoPayment)
async def get_payment(
        payment_id: PydanticObjectId,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Get payment
    This function gets a payment.
    """
    payment_dict = db["payments"].find_one({"_id": payment_id})

    if not payment_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Payment not found")

    print(f"{payment_dict = }")
    sender_dict = db["users"].find_one({"_id": payment_dict["payer_id"]})
    recipient_dict = db["users"].find_one(
        {"_id": payment_dict["recipient_id"]})

    if not payment_dict or not sender_dict or not recipient_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Payment not found")

    if not (sender_dict["_id"] == user.id
            or recipient_dict["_id"] == user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not allowed to access this"
                                   " payment")

    payment = api_resp.FullInfoPayment(**payment_dict,
                                       sender=sender_dict,
                                       recipient=recipient_dict)
    return payment


async def get_group_payments(
        group_id: PydanticObjectId,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Get group payments
    This function gets all payments for a group.
    """
    group_dict = db["groups"].find_one({"_id": group_id})
    if not group_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Group not found")

    if user.id not in group_dict["member_ids"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not a member of this group")

    bill_dicts = db["bills"].find({"group_id": group_id})
    bill_ids = [bill_dict["_id"] for bill_dict in bill_dicts]
    print(f"{bill_ids = }")

    payment_dicts = db["payments"].find({"bill_id": {"$in": bill_ids}})
    payment_dicts = [
        payment_dict for payment_dict in payment_dicts
        if payment_dict["payer_id"] == user.id
           or payment_dict["recipient_id"] == user.id
    ]
    print(f"{payment_dicts = }")
    payments = [await get_payment(payment_dict["_id"], user)
                for payment_dict in payment_dicts]

    return payments


@router.patch("/{payment_id}/status", status_code=200,
              response_model=api_resp.FullInfoPayment)
async def change_payment_status(
        payment_id: PydanticObjectId,
        payment_status: models.PaymentStatus,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Change payment status
    This function changes the status of a payment.
    """
    payment_dict = db["payments"].find_one({"_id": payment_id})

    if not payment_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Payment not found")

    sender_dict = db["users"].find_one({"_id": payment_dict["payer_id"]})
    recipient_dict = db["users"].find_one(
        {"_id": payment_dict["recipient_id"]})

    if not payment_dict or not sender_dict or not recipient_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Payment not found")

    if not (sender_dict["_id"] == user.id
            or recipient_dict["_id"] == user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not allowed to access this"
                                   " payment")

    db["payments"].update_one(
        {"_id": payment_id},
        {"$set": {"status": payment_status}}
    )

    payment_dict = db["payments"].find_one({"_id": payment_id})
    payment = api_resp.FullInfoPayment(**payment_dict,
                                       sender=sender_dict,
                                       recipient=recipient_dict)
    return payment


@router.patch("/{payment_id}/method", status_code=200,
              response_model=api_resp.FullInfoPayment)
async def change_payment_method(
        payment_id: PydanticObjectId,
        payment_method: models.PaymentMethod,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Change payment method
    This function changes the method of a payment.
    """
    payment_dict = db["payments"].find_one({"_id": payment_id})

    if not payment_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Payment not found")

    sender_dict = db["users"].find_one({"_id": payment_dict["payer_id"]})
    recipient_dict = db["users"].find_one(
        {"_id": payment_dict["recipient_id"]})

    if not payment_dict or not sender_dict or not recipient_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Payment not found")

    if not (sender_dict["_id"] == user.id
            or recipient_dict["_id"] == user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not allowed to access this"
                                   " payment")

    if not sender_dict["revolut_id"] or not recipient_dict["revolut_id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Both users must have a Revolut ID to"
                                   " change the payment method to Revolut")

    db["payments"].update_one(
        {"_id": payment_id},
        {"$set": {"method": payment_method}}
    )

    payment_dict = db["payments"].find_one({"_id": payment_id})
    payment = api_resp.FullInfoPayment(**payment_dict,
                                       sender=sender_dict,
                                       recipient=recipient_dict)
    return payment
