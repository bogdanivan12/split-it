from typing import Annotated
from datetime import datetime
from starlette import status
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends

from backend.api import users
from backend.api import payments
from backend.common import models
from backend.common import config_info
from backend.api import api_request_classes as api_req
from backend.api import api_response_classes as api_resp

router = APIRouter(prefix="/api/v1/bills", tags=["bills"])
db = config_info.get_db()


@router.post("/", status_code=status.HTTP_201_CREATED,
             response_model=models.Bill)
async def create_bill(
        bill_req: api_req.CreateBillRequest,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Create bill
    This endpoint creates a bill.
    """
    bill = models.Bill(**bill_req.model_dump(),
                       owner_id=user.id)

    if not db["groups"].find_one({"_id": bill.group_id}):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Group not found")

    for payer in bill.payers:
        if not db["users"].find_one({"_id": payer.user_id}):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Member not found")

    for payer in bill.initial_payers:
        if not db["users"].find_one({"_id": payer.user_id}):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Payer not found")

    for product in bill.products:
        for payer in product.assigned_payers:
            if not db["users"].find_one({"_id": payer.user_id}):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                    detail="Payer not found")

    bill_dict = bill.model_dump(by_alias=True)
    bill_dict.pop("_id", None)
    try:
        db_result = db["bills"].insert_one(bill_dict)
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    bill.id = PydanticObjectId(db_result.inserted_id)

    try:
        payment_ids = payments.create_payments(bill)
    except ValueError as exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=str(exception))
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))
    bill.payment_ids = payment_ids

    bill_dict = bill.model_dump(by_alias=True)
    bill_dict.pop("_id", None)
    try:
        db["bills"].update_one({"_id": bill.id},
                               {"$set": bill_dict})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    return bill


@router.get("/{bill_id}", status_code=status.HTTP_200_OK,
            response_model=api_resp.FullInfoBill)
async def get_bill(
        bill_id: PydanticObjectId,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Get bill by id
    This endpoint returns the bill with the specified id.
    """
    bill_dict = db["bills"].find_one({"_id": bill_id})
    if not bill_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bill not found")

    bill = models.Bill(**bill_dict)

    group_dict = db["groups"].find_one({"_id": bill.group_id})
    if user.id not in group_dict["member_ids"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not a member of this group")
    group = api_resp.GroupSummary(_id=group_dict["_id"],
                                  name=group_dict["name"])

    owner_dict = db["users"].find_one({"_id": bill.owner_id})
    owner = api_resp.UserSummary(_id=owner_dict["_id"],
                                 username=owner_dict["username"],
                                 full_name=owner_dict["full_name"])

    initial_payers_info = []
    for payer in bill.initial_payers:
        payer_dict = db["users"].find_one({"_id": payer.user_id})
        payer_info = api_resp.FullInfoPayer(
            user_id=payer.user_id,
            user=api_resp.UserSummary(
                _id=payer.user_id,
                username=payer_dict["username"],
                full_name=payer_dict["full_name"]
            ),
            amount=payer.amount
        )
        initial_payers_info.append(payer_info)

    payers_info = []
    for payer in bill.payers:
        payer_dict = db["users"].find_one({"_id": payer.user_id})
        payer_info = api_resp.FullInfoPayer(user=api_resp.UserSummary(
            _id=payer_dict["_id"],
            username=payer_dict["username"],
            full_name=payer_dict["full_name"]
        ), amount=payer.amount)
        payers_info.append(payer_info)

    products_info = []
    for product in bill.products:
        assigned_payers_info = []
        for payer in product.assigned_payers:
            payer_dict = db["users"].find_one({"_id": payer.user_id})
            payer_info = api_resp.FullInfoPayer(
                user_id=payer.user_id,
                user=api_resp.UserSummary(
                    _id=payer_dict["_id"],
                    username=payer_dict["username"],
                    full_name=payer_dict["full_name"]
                ),
                amount=payer.amount
            )
            assigned_payers_info.append(payer_info)

        product_info = api_resp.FullInfoProduct(
            name=product.name,
            total_price=product.total_price,
            quantity=product.quantity,
            assigned_payers=product.assigned_payers,
            assigned_payers_info=assigned_payers_info
        )
        products_info.append(product_info)

    bill_info = api_resp.FullInfoBill(
        **bill_dict,
        owner=owner,
        group=group,
        initial_payers_info=initial_payers_info,
        payers_info=payers_info,
        products_info=products_info
    )
    return bill_info


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bill(bill_id: PydanticObjectId,
                      user: models.User = Depends(users.get_current_user)):
    """
    # Delete bill
    This endpoint deletes a bill.

    If a payment for the bill has been completed, the payment is reversed,
    and the user that received the money has to give it back, because it was
    a mistake.
    """
    bill = db["bills"].find_one({"_id": bill_id})
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bill not found")

    if bill["owner_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not the owner of the bill")

    payment_ids = bill["payment_ids"]
    payments = db["payments"].find({"_id": {"$in": payment_ids}})
    for payment in payments:
        if payment["status"] == models.PaymentStatus.COMPLETED:
            reverse_payment = models.Payment(**payment)
            reverse_payment.bill_id = None
            (reverse_payment.payer_id,
             reverse_payment.recipient_id) = (reverse_payment.recipient_id,
                                              reverse_payment.payer_id)
            reverse_payment.date = datetime.now()
            reverse_payment.method = models.PaymentMethod.NOT_SELECTED
            reverse_payment.status = models.PaymentStatus.NOT_STARTED
            reverse_payment_dict = reverse_payment.model_dump(by_alias=True)
            reverse_payment_dict.pop("_id", None)
            try:
                db["payments"].insert_one(reverse_payment_dict)
            except Exception as exception:
                raise HTTPException(
                    status_code=status.HTTP_424_FAILED_DEPENDENCY,
                    detail=str(exception)
                )
        try:
            db["payments"].delete_one({"_id": payment["_id"]})
        except Exception as exception:
            raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                                detail=str(exception))

    try:
        db_result = db["bills"].delete_one({"_id": bill_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    if db_result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Bill not found")
