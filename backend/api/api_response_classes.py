from typing import List
from pydantic import BaseModel

from backend.common import models

class GetRequestsResponseForStatus(BaseModel):
    sent: List[models.Request]
    received: List[models.Request]
