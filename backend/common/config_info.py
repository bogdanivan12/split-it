import os
import pathlib

from dotenv import load_dotenv
from pymongo.database import Database
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

load_dotenv(pathlib.Path(__file__).parent / ".env")
MONGODB_URL = os.getenv("MONGODB_URL")
HASH_KEY = os.getenv("HASH_KEY")

client = MongoClient(MONGODB_URL, server_api=ServerApi("1"))
db = client.split_it


def get_db() -> Database:
    return db
