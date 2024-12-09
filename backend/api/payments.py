import math

from backend.common import models
from backend.common import config_info

db = config_info.get_db()


def create_payments(bill: models.Bill):
    """
    # Create payments
    This function creates payments for a bill.
    """
    total_amounts_to_pay = {}
    if bill.bill_type == models.BillType.SPLIT_BY_MEMBERS:
        for payer in bill.payer_ids:
            if payer.user_id not in total_amounts_to_pay:
                total_amounts_to_pay[payer.user_id] = 0
            total_amounts_to_pay[payer.user_id] += payer.amount
        print(f"{total_amounts_to_pay = }")
    elif bill.bill_type == models.BillType.SPLIT_BY_PRODUCTS:
        for product in bill.products:
            for payer in product.assigned_payers:
                if payer.user_id not in total_amounts_to_pay:
                    total_amounts_to_pay[payer.user_id] = 0
                total_amounts_to_pay[payer.user_id] += payer.amount
        print(f"{total_amounts_to_pay = }")

    total_amount_to_receive = 0
    total_amounts_to_receive = {}
    for initial_payer in bill.initial_payers:
        user_id = initial_payer.user_id
        amount = initial_payer.amount
        if (user_id in total_amounts_to_pay
                and amount >= total_amounts_to_pay[user_id]):
            amount -= total_amounts_to_pay[user_id]
            total_amounts_to_pay.pop(user_id, None)
        elif (user_id in total_amounts_to_pay
              and amount < total_amounts_to_pay[user_id]):
            total_amounts_to_pay[user_id] -= amount
            amount = 0
        if amount > 0:
            total_amounts_to_receive[user_id] = amount
            total_amount_to_receive += amount

    print(f"{total_amounts_to_receive = }")

    total_amounts_to_pay = {
        user_id: amount
        for user_id, amount in total_amounts_to_pay.items()
        if amount > 0
    }
    total_amounts_to_receive = {
        user_id: amount
        for user_id, amount in total_amounts_to_receive.items()
        if amount > 0
    }
    payments = []
    for payer, amount_to_pay in total_amounts_to_pay.items():
        for recipient, initial_payed_amount in total_amounts_to_receive.items():
            percentage = initial_payed_amount / total_amount_to_receive
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

    # if not payments:
    #     return []

    db_result = db["payments"].insert_many(payments)
    return db_result.inserted_ids
