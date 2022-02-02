swagger_ui = """<!DOCTYPE html>
<html>
<link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui.css">

<head>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui-standalone-preset.js"></script>
    <script>
       window.onload = function() {
           const ui = SwaggerUIBundle({
              url: window.location.href + ".json",
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
                ],
              layout: "StandaloneLayout"
           })
           window.ui = ui;
       }
    </script>
</head>

<body></body>
</html>
"""


def handler(events, context):
    return {
        "statusCode": 200,
        "body": swagger_ui,
        "headers": {"content-type": "text/html"},
    }
