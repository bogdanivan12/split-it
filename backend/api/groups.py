import string
import secrets

from starlette import status
from datetime import datetime
from typing import Annotated, List
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends

from backend.api import users
from backend.common import models
from backend.common import config_info
from backend.api import api_request_classes as api_req
from backend.api import api_response_classes as api_res

router = APIRouter(prefix="/api/v1/groups", tags=["groups"])
db = config_info.get_db()


def generate_join_code(length: int) -> str:
    characters = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(characters) for _ in range(length))


def generate_unique_join_code(length: int) -> str:
    while True:
        join_code = generate_join_code(length)
        if not db["groups"].find_one({"join_code": join_code}):
            return join_code


@router.post("/", status_code=status.HTTP_201_CREATED,
             response_model=models.Group)
async def create_group(
        request: api_req.CreateGroupRequest,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Create a new group
    Creates a new group in the database.
    ```
    Args:
        request.name (str): The name of the group.
        request.description (str): The description of the group.
    ```
    """
    join_code = generate_unique_join_code(config_info.JOIN_CODE_LENGTH)
    group = models.Group(
        name=request.name,
        description=request.description,
        owner_id=user.id,
        member_ids=[user.id],
        join_code=join_code
    )
    group_dict = group.model_dump(by_alias=True)
    group_dict.pop("_id", None)

    try:
        db_result = db["groups"].insert_one(group_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))

    group.id = db_result.inserted_id
    return group


@router.get("/{group_id}", status_code=status.HTTP_200_OK,
            response_model=api_res.FullInfoGroup)
async def get_group(
        group_id: PydanticObjectId,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Get group by id
    Retrieves a group by its id from the database.
    ```
    Args:
        group_id (str): The id of the group to retrieve.
        user (models.User): The authenticated user.
    ```
    """
    try:
        group_dict = db["groups"].find_one({"_id": group_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))
    if not group_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Group not found")

    group = models.Group(**group_dict)

    if user.id not in group.member_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="User is not a member of the group")
    
    try:
        users_cursor = db["users"].find({"_id": {"$in": group.member_ids}}, {"_id": 1, "username": 1, "full_name": 1})
        users = list(users_cursor)
        user_objects = [api_res.UserSummary(**user) for user in users]
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=str(exception))

    return api_res.FullInfoGroup(
        bill_ids=group.bill_ids,
        name=group.name,
        description=group.description,
        join_code=group.join_code,
        members=user_objects,
        owner_id=group.owner_id,
        _id=group_id
    )

@router.get("/", status_code=status.HTTP_200_OK,
            response_model=List[models.Group])
async def get_groups(
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Get all groups
    Retrieves all groups from the database.
    """
    try:
        groups = db["groups"].find()
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    group_objects = [models.Group(**group)
                     for group in groups
                     if user.id in group["member_ids"]]
    return group_objects


@router.put("/{group_id}", status_code=status.HTTP_200_OK,
            response_model=models.Group)
async def update_group(
        group_id: PydanticObjectId,
        request: api_req.UpdateGroupRequest,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Update group by id
    Updates a group by its id in the database.
    ```
    Args:
        group_id (str): The id of the group to update.
        request (api_req.UpdateGroupRequest): The request body with the updated
                                            group information.
        user (models.User): The authenticated user.
    ```
    """
    try:
        group_dict = db["groups"].find_one({"_id": group_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    if not group_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Group not found")
    if user.id != group_dict["owner_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not the owner of the group")

    update_data = request.model_dump(exclude_unset=True)
    group_dict.update(update_data)
    group_dict.pop("_id", None)

    try:
        db["groups"].update_one({"_id": group_id},
                                {"$set": group_dict})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    group = models.Group(**group_dict)
    group.id = group_id

    return group


@router.post("/join/{join_code}", status_code=status.HTTP_201_CREATED)
async def join_group(
        join_code: str,
        user: Annotated[models.User, Depends(users.get_current_user)]
):
    """
    # Join a group using a join code
    Validates the join code and creates a join request.
    """
    group_dict = db["groups"].find_one({"join_code": join_code})
    if not group_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Invalid join code")
    if user.id in group_dict["member_ids"]:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="You are already a member of the group")

    group = models.Group(**group_dict)
    existing_request = db["requests"].find_one({
        "group_id": group_dict["_id"],
        "sender_id": user.id,
        "type": models.RequestType.JOIN_GROUP,
        "status": models.RequestStatus.PENDING
    })
    if existing_request:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="You have already requested to join this group")
    
    existing_request = db["requests"].find_one({
        "group_id": group_dict["_id"],
        "recipiend_id": user.id,
        "type": models.RequestType.JOIN_GROUP,
        "status": models.RequestStatus.PENDING
    })
    if existing_request:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="You have already been invited to this group")
    join_request = models.Request(
        group_id=group.id,
        sender_id=user.id,
        recipient_id=group.owner_id,
        date=datetime.now()
    )
    join_request_dict = join_request.model_dump(by_alias=True)
    join_request_dict.pop("_id", None)

    try:
        db["requests"].insert_one(join_request_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))


@router.get("/{group_id}/users", status_code=status.HTTP_200_OK, response_model=List[api_res.UserSummary])
async def get_users_by_group_id(
    group_id: PydanticObjectId,
    user: Annotated[models.User, Depends(users.get_current_user)]
):
    try:
        group_dict = db["groups"].find_one({"_id": group_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=str(exception))

    if not group_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    group = models.Group(**group_dict)

    if user.id not in group.member_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not a member of the group")

    try:
        users_cursor = db["users"].find({"_id": {"$in": group.member_ids}}, {"_id": 1, "username": 1, "full_name": 1})
        users = list(users_cursor)
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=str(exception))

    user_objects = [api_res.UserSummary(**user) for user in users]
    return user_objects


@router.get("/{group_id}/member/{username}", status_code=status.HTTP_200_OK,
            response_model=api_res.IsUserInGroup)
def get_user_member_in_group(username: str, group_id: PydanticObjectId):
    """
    # Check if user is in group or has a pending request
    This endpoint returns whether a user is a member of the group or has a related request, using username.
    """
    try:
        group = db["groups"].find_one({"_id": group_id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=str(exception))
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    
    try:
        user = db["users"].find_one({"username": username})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=str(exception))
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user_id = user["_id"]

    
    if user_id in group["member_ids"]:
        return {"in_group": True, "has_request": False}
    
    try:
        request_exists = db["requests"].find_one({
            "group_id": group_id,
            "status": "PENDING",
            "$or": [
                {"sender_id": user_id},
                {"recipient_id": user_id}
            ]
        })
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=str(exception))
    if request_exists:
        return {"in_group": False, "has_request": True}

    return {"in_group": False, "has_request": False}
    