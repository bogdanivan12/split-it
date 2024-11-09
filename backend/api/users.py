from beanie import PydanticObjectId
from fastapi import HTTPException, APIRouter, Form, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from starlette import status
from typing import Annotated

from backend.api import auth
from backend.common import config_info
from backend.common import models

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

    if db["users"].find_one({"username": user_dict["username"]}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Username already exists")

    if db["users"].find_one({"email": user_dict["email"]}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Email already exists")

    try:
        db_result = db["users"].insert_one(user_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))

    user_dict.pop("hashed_password", None)
    user = models.User(**user_dict)
    user.id = PydanticObjectId(db_result.inserted_id)
    return user
