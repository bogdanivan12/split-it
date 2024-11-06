from fastapi import APIRouter, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from starlette import status

from backend.api import api_request_classes as req_cls
from backend.common import config_info

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = config_info.get_db()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: req_cls.CreateUserRequest):
    user_dict = request.model_dump(by_alias=True)
    user_dict.pop("password")
    user_dict["hashed_password"] = hash_password(request.password)
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
    db["users"].insert_one(user_dict)
