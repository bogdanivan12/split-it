import jwt
import random

from typing import Annotated
from starlette import status
from pydantic import EmailStr
from beanie import PydanticObjectId
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import HTTPException, APIRouter, Form, Depends

from backend.api import auth
from backend.common import models
from backend.common import config_info

router = APIRouter(prefix="/api/v1/users", tags=["users"])
db = config_info.get_db()


@router.post("/", status_code=status.HTTP_201_CREATED,
             response_model=models.User)
async def register(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        email: EmailStr = Form(min_length=5, max_length=50)
):
    """
    # Register a new user
    Registers a new user in the database.
    The user's password is hashed before being stored.
    """
    user = models.UserInDB(
        username=form_data.username,
        email=email,
        hashed_password=auth.hash_password(form_data.password)
    )
    user_dict = user.model_dump(by_alias=True)
    user_dict.pop("_id", None)

    if db["users"].find_one({"$or": [{"username": user_dict["username"]},
                                     {"email": user_dict["email"]}]}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Username or email already exists")

    try:
        db_result = db["users"].insert_one(user_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))

    user_dict.pop("hashed_password", None)
    user = models.User(**user_dict)
    user.id = PydanticObjectId(db_result.inserted_id)
    return user


@router.get("/me", status_code=status.HTTP_200_OK,
            response_model=models.User)
def get_current_user(token: Annotated[str, Depends(auth.oauth2_scheme)]):
    """
    # Get current user
    This endpoint returns the information about the authenticated user based
    on the access token.
    """
    try:
        payload = jwt.decode(token, config_info.HASH_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Expired token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid token")

    try:
        user = db["users"].find_one({"username": payload["sub"]})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found")
    return models.User(**user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user: models.User = Depends(get_current_user)):
    """
    # Delete a user
    Deletes a user from the database.

    *Before deleting the user, the ownership of the groups owned by the user
    is randomly transferred to another member of the group.*
    """
    # Transfer ownership of groups before deleting the user
    try:
        owned_groups = db["groups"].find({"owner_id": user.id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    for group in owned_groups:
        if len(group["member_ids"]) == 1:
            try:
                db["groups"].delete_one({"_id": group["_id"]})
            except Exception as exception:
                raise HTTPException(
                    status_code=status.HTTP_424_FAILED_DEPENDENCY,
                    detail=str(exception)
                )
            continue

        group["member_ids"].remove(user.id)
        try:
            db["groups"].update_one(
                {"_id": group["_id"]},
                {"$set": {
                    "owner_id": random.choice(group["member_ids"])
                }}
            )
        except Exception as exception:
            raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                                detail=str(exception))

    # Remove user from all groups
    try:
        db["groups"].update_many(
            {"member_ids": {"$in": [user.id]}},
            {"$pull": {"member_ids": user.id}}
        )
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    # Delete user
    try:
        result = db["users"].delete_one({"_id": user.id})
    except Exception as exception:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(exception))

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found")
