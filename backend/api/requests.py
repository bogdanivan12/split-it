from starlette import status
from typing import Annotated, Dict
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from backend.common import models
from backend.api.groups import db
from backend.api import users, api_request_classes
from backend.api.api_response_classes import GetRequestsResponseForStatus


router = APIRouter(prefix="/api/v1/requests", tags=["requests"])


@router.get("/", status_code=status.HTTP_200_OK,
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


@router.get("/{request_id}", status_code=status.HTTP_200_OK,
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


@router.post("/join-group/{request_id}/accept",
             status_code=status.HTTP_204_NO_CONTENT)
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


@router.post("/{request_id}/decline",
             status_code=status.HTTP_204_NO_CONTENT)
async def decline_request(
    request_id: PydanticObjectId,
    user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Decline request
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


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: PydanticObjectId,
    user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Delete request
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

    try:
        db["requests"].delete_one({"_id": request_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))


@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_users_to_group(
        request: api_request_classes.InviteToGroupRequestBulk,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Send group invite requests
    Sends group invite requests to multiple users and saves them in the database.
    """
    recipients_cursor = db["users"].find({"username": {"$in": request.usernames}})
    recipients = list(recipients_cursor)
    recipient_map = {recipient["username"]: recipient for recipient in recipients}

    try:
        group = db["groups"].find_one({"_id": request.group_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=str(exception))

    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    invite_requests = []
    for username in request.usernames:
        recipient = recipient_map[username]
        invite_request = models.Request(
            sender_id=user.id,
            recipient_id=recipient["_id"],
            group_id=request.group_id,
            type=models.RequestType.INVITE_TO_GROUP
        )
        invite_request_dict = invite_request.model_dump(by_alias=True)
        invite_request_dict.pop("_id", None)
        invite_requests.append(invite_request_dict)

    try:
        db["requests"].insert_many(invite_requests)
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))


@router.post("/invite/{request_id}/accept",
             status_code=status.HTTP_204_NO_CONTENT)
async def accept_group_invite_request(
        request_id: PydanticObjectId,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Accept group invite request
    Accepts a group invite request and updates the receiver's membership status
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

    if request.type != models.RequestType.INVITE_TO_GROUP:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid request type")

    try:
        db["users"].update_one(
            {"_id": request.recipient_id},
            {"$addToSet": {"groups": request.group_id}}
        )
        db["requests"].update_one(
            {"_id": request_id},
            {"$set": {"status": models.RequestStatus.ACCEPTED}}
        )
        db["groups"].update_one(
            {"_id": request.group_id},
            {"$addToSet": {"member_ids": request.recipient_id}}
        )
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))
