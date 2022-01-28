import json

if __name__ == "swaggerjson":
    from swagger.swagger import docs
else:
    from .swagger import docs


def handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps(docs),
    }
