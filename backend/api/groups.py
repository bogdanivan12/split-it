from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends
from starlette import status
from typing import Annotated, List

from backend.api import auth
from backend.api import api_request_classes as api_req
from backend.common import config_info
from backend.common import models

router = APIRouter(prefix="/api/v1/groups", tags=["groups"])
db = config_info.get_db()


@router.post("/", status_code=status.HTTP_201_CREATED,
             response_model=models.Group)
async def create_group(
        request: api_req.CreateGroupRequest,
        user: Annotated[models.User, Depends(auth.get_current_user)]
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
    group = models.Group(
        name=request.name,
        description=request.description,
        owner_id=user.id,
        member_ids=[user.id]
    )
    group_dict = group.model_dump(by_alias=True)
    group_dict.pop("_id", None)

    try:
        db_result = db["groups"].insert_one(group_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))

    group.id = PydanticObjectId(db_result.inserted_id)
    return group


@router.get("/{group_id}", status_code=status.HTTP_200_OK,
            response_model=models.Group)
async def get_group(
        group_id: PydanticObjectId,
        user: Annotated[models.User, Depends(auth.get_current_user)]
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
    group_dict = db["groups"].find_one({"_id": group_id})
    if not group_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Group not found")
    group = models.Group(**group_dict)
    if user.id not in group.member_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="User is not a member of the group")
    return group


@router.get("/", status_code=status.HTTP_200_OK,
            response_model=List[models.Group])
async def get_groups(
        user: Annotated[models.User, Depends(auth.get_current_user)]
):
    """
    # Get all groups
    Retrieves all groups from the database.
    """
    groups = db["groups"].find()
    group_objects = [models.Group(**group)
                     for group in groups
                     if user.id in group["member_ids"]]
    return group_objects


@router.put("/{group_id}", status_code=status.HTTP_200_OK,
            response_model=models.Group)
async def update_group(
        group_id: PydanticObjectId,
        request: api_req.UpdateGroupRequest,
        user: Annotated[models.User, Depends(auth.get_current_user)]
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
    group_dict = db["groups"].find_one({"_id": group_id})
    if not group_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Group not found")
    group = models.Group(**group_dict)
    if user.id != group.owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not the owner of the group")

    update_data = {k: v for k, v in request.dict(exclude_unset=True).items()
                   if v is not None}

    for key, value in update_data.items():
        setattr(group, key, value)

    group_dict = group.model_dump(by_alias=True)
    group_dict.pop("_id", None)

    try:
        db["groups"].update_one({"_id": group_id},
                                {"$set": group_dict})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))
    return group
