import json
import sys
import os
import numpy as np
from dotenv import load_dotenv
from pymongo import MongoClient
from .Constants import *

load_dotenv()

client = MongoClient(os.environ["DB_URI"])
db = client.pathFinderDatabase
records_collection = db.records
users_collection = db.users
result = sys.argv[1]

prediction = json.load