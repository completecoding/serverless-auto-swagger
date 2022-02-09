swagger_ui = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SwaggerUI</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script
      src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"
      crossorigin
    ></script>
    <script
      src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"
      crossorigin
    ></script>
    <script>
      window.onload = () => {
        const ui = SwaggerUIBundle({
          url: window.location.href + '.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>

"""


def handler(events, context):
    return {
        "statusCode": 200,
        "body": swagger_ui,
        "headers": {"content-type": "text/html"},
    }
