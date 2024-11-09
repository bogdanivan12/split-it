# backend/api/groups.py
from typing import Annotated, List

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Depends
from starlette import status

from backend.api import auth
from backend.common import config_info
from backend.common import models

router = APIRouter(prefix="/api/v1/groups", tags=["groups"])
db = config_info.get_db()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_group(request: models.Group):
    """
    # Create a new group
    Creates a new group in the database.
    ```
    Args:
        request.id (str): The id of the group.
        request.name (str): The name of the group.
        request.owner_id (str): The id of the group owner.
        request.member_ids (List[str]): The ids of the group members.
        request.description (str): The description of the group.
        request.bill_ids (List[str]): The ids of the bills associated with
                                      the group.
    ```
    """
    group_dict = request.model_dump(by_alias=True)

    if db["groups"].find_one({"name": group_dict["name"]}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Group name already exists")
    if not db["users"].find_one({"_id": group_dict["owner_id"]}):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found")
    if group_dict["owner_id"] not in group_dict["member_ids"]:
        group_dict["member_ids"].append(group_dict["owner_id"])
    if group_dict.get("_id") is None:
        group_dict.pop("_id", None)

    try:
        db["groups"].insert_one(group_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))


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
