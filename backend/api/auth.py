import jwt
import datetime

from typing import Annotated
from starlette import status
from passlib.context import CryptContext
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from backend.common import models
from backend.common import config_info

EXPIRE_MINUTES = 30

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = config_info.get_db()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_token(username: str,
                   hash_key: str,
                   expire_minutes: int = EXPIRE_MINUTES) -> str:
    payload = {
        "sub": username,
        "exp": (datetime.datetime.now(datetime.timezone.utc)
                + datetime.timedelta(minutes=expire_minutes)),
    }
    return jwt.encode(payload, hash_key, algorithm="HS256")


@router.post("/token", status_code=status.HTTP_200_OK,
             response_model=models.Token)
async def get_login_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    # Get login token
    This endpoint returns an access token based on the username and password
    provided.
    """
    user = db["users"].find_one({"username": form_data.username})
    if (not user or
            not verify_password(form_data.password, user["hashed_password"])):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password")
    access_token = generate_token(form_data.username, config_info.HASH_KEY)
    return models.Token(access_token=access_token)
