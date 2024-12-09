from starlette import status
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends

from backend.api import users
from backend.common import models
from backend.common import config_info
from backend.api import api_request_classes as api_req
from backend.api import payments

router = APIRouter(prefix="/api/v1/bills", tags=["bills"])
db = config_info.get_db()


@router.post("/", status_code=status.HTTP_201_CREATED,
             response_model=models.Bill)
async def create_bill(
        bill_req: api_req.CreateBillRequest,
        user: models.User = Depends(users.get_current_user)
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
        db_result = db["bills"].insert_one(bill_dict)
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    bill.id = PydanticObjectId(db_result.inserted_id)
    return bill
