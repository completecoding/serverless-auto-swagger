import json
from .swagger import docs

def handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps(docs),
    }
