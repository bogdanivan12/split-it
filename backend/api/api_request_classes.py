from pydantic import Field

from backend.common import models


class CreateUserRequest(models.User):
    password: str = Field(min_length=8, max_length=128)


class CreateGroupRequest(models.Group):
    name: str = Field(min_length=5, max_length=30)
    owner_id: str
    description: str = ""
