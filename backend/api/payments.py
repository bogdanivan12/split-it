import math
from typing import Dict, Union
from beanie import PydanticObjectId

from backend.common import models
from backend.common import config_info

db = config_info.get_db()


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

    if not payments:
        return []

    db_result = db["payments"].insert_many(payments)
    return db_result.inserted_ids
