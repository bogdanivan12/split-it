import datetime
import jwt
import os

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from typing import Annotated
from starlette import status

from backend.common import config_info
from backend.common import models

HASH_KEY = os.getenv("HASH_KEY")
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


@router.get("/me", status_code=status.HTTP_200_OK,
            response_model=models.User)
def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    # Get current user
    This endpoint returns the information about the authenticated user based
    on the access token.
    """
    try:
        payload = jwt.decode(token, HASH_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Expired token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid token")

    user = db["users"].find_one({"username": payload["sub"]})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found")
    return user


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
    access_token = generate_token(form_data.username, HASH_KEY)
    return models.Token(access_token=access_token)
