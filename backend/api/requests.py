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
