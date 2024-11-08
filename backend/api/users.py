from fastapi import HTTPException, APIRouter
from starlette import status

from backend.api import api_request_classes as api_req
from backend.api import auth
from backend.common import config_info

router = APIRouter(prefix="/api/v1/users", tags=["users"])
db = config_info.get_db()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def register(request: api_req.CreateUserRequest):
    """
    # Register a new user
    Registers a new user in the database.
    The user's password is hashed before being stored.
    ```
    Args:
        request.id (str): The user's id.
        request.username (str): The user's username.
        request.email (str): The user's email address.
        request.password (str): The user's password.
        request.phone_number (str): The user's phone number.
        request.full_name (str): The user's full name.
        request.revolut_id (str): The user's Revolut id.
        request.group_ids (List[str]): The ids of the groups the user is in.
    ```
    """
    user_dict = request.model_dump(by_alias=True)

    user_dict.pop("password")
    user_dict["hashed_password"] = auth.hash_password(request.password)

    if user_dict.get("_id") is None:
        user_dict.pop("_id", None)

    if db["users"].find_one({"username": user_dict["username"]}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Username already exists")

    if db["users"].find_one({"email": user_dict["email"]}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Email already exists")

    if user_dict.get("phone_number") and db["users"].find_one(
            {"phone_number": user_dict["phone_number"]}):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Phone number already exists")

    try:
        db["users"].insert_one(user_dict)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY,
                            detail=str(e))
