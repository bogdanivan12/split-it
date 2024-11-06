from pydantic import Field

from backend.common import models


class CreateUserRequest(models.User):
    password: str = Field(min_length=8, max_length=128)
