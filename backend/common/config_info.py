import os

from pymongo.database import Database
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

client = MongoClient(os.environ["MONGODB_URL"], server_api=ServerApi("1"))
db = client.split_it

JOIN_CODE_LENGTH = 6


def get_db() -> Database:
    return db
