# backend/api/groups.py
from fastapi import APIRouter, HTTPException
from starlette import status
from bson import ObjectId

from backend.api.api_request_classes import CreateGroupRequest
from backend.common import config_info
from backend.common.models import Group

router = APIRouter(prefix="/api/v1/groups", tags=["groups"])
db = config_info.get_db()


@router.post("/create_group", status_code=status.HTTP_201_CREATED)
async def create_group(request: CreateGroupRequest):
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

    db["groups"].insert_one(group_dict)
