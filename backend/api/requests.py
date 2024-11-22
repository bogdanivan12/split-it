from starlette import status
from typing import Annotated, Dict
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from api import users
from common import models
from api.groups import db
from api.api_response_classes import GetRequestsResponseForStatus


router = APIRouter(prefix="/api/v1/requests", tags=["requests"])


@router.get("/requests", status_code=status.HTTP_200_OK,
            response_model=Dict[models.RequestType,
                                GetRequestsResponseForStatus])
async def get_requests(
    user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Get all requests
    Retrieves all requests from the database.
    """
    try:
        requests = db["requests"].find()
        print(requests)
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    request_objects = [
        models.Request(**request)
        for request in requests
        if user.id in [request["sender_id"], request["recipient_id"]]
    ]

    response = {}
    for request_obj in request_objects:
        if request_obj.type not in response:
            response[request_obj.type] = {"sent": [], "received": []}

        if request_obj.sender_id == user.id:
            response[request_obj.type]["sent"].append(request_obj)
        else:
            response[request_obj.type]["received"].append(request_obj)

    return response


@router.get("/requests/{request_id}", status_code=status.HTTP_200_OK,
            response_model=models.Request)
async def get_request(
        request_id: PydanticObjectId,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Get request by id
    Retrieves a request by its id from the database.
    ```
    Args:
        request_id (str): The id of the request to retrieve.
        user (models.User): The authenticated user.
    ```
    """
    try:
        request_dict = db["requests"].find_one({"_id": request_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    if not request_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Request not found")

    request = models.Request(**request_dict)

    if user.id not in [request.sender_id, request.recipient_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You're not authorized to view this request")
    return request


@router.post("/requests/{request_id}/accept",
             status_code=status.HTTP_200_OK)
async def accept_join_group_request(
    request_id: PydanticObjectId,
    user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Accept join group request
    Accepts a join request and updates the sender's membership status and join
    request status in the database.
    """
    try:
        request_dict = db["requests"].find_one({"_id": request_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    if not request_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Request not found")

    request = models.Request(**request_dict)

    if request.recipient_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You're not authorized "
                                   "to accept this request")

    if request.type != models.RequestType.JOIN_GROUP:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid request type")

    try:
        db["users"].update_one(
            {"_id": request.sender_id},
            {"$addToSet": {"groups": request.group_id}}
        )
        db["requests"].update_one(
            {"_id": request_id},
            {"$set": {"status": models.RequestStatus.ACCEPTED}}
        )
        db["groups"].update_one(
            {"_id": request.group_id},
            {"$addToSet": {"member_ids": request.sender_id}}
        )
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    return {"detail": "Join request accepted successfully"}


@router.post("/requests/{request_id}/decline",
             status_code=status.HTTP_200_OK)
async def decline_join_request(
    request_id: PydanticObjectId,
    user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Decline join request
    Declines a join request and updates the join request status in the database
    """
    try:
        request_dict = db["requests"].find_one({"_id": request_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    if not request_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Request not found")

    request = models.Request(**request_dict)

    if request.recipient_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You're not authorized "
                                   "to decline this request")

    if request.type not in models.RequestType:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid request type")

    try:
        db["requests"].update_one(
            {"_id": request_id},
            {"$set": {"status": models.RequestStatus.DECLINED}}
        )
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    return {"detail": "Join request declined"}


@router.delete("/requests/{request_id}", status_code=status.HTTP_200_OK)
async def delete_join_request(
    request_id: PydanticObjectId,
    user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Delete join request
    Deletes a join request if its status is DECLINED or ACCEPTED.
    """
    try:
        request_dict = db["requests"].find_one({"_id": request_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    if not request_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Request not found")

    request = models.Request(**request_dict)

    if request.recipient_id != user.id and request.sender_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You're not authorized to delete "
                                   "this request")

    if request.status not in [models.RequestStatus.DECLINED,
                              models.RequestStatus.ACCEPTED]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Only requests with status "
                                   "DECLINED or ACCEPTED can be deleted")

    try:
        db["requests"].delete_one({"_id": request_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    return {"detail": "Join request deleted successfully"}
