import json

if __name__ != "__main__":
    from swagger.swagger import docs
else:
    from .swagger import docs


def handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps(docs),
    }
