exports.handler = async () => {
  return {
    statusCode: 200,
    body: swaggerUI,
    headers: {
      'content-type': 'text/html',
    },
  };
};

const swaggerUI = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SwaggerUI</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css"
    />
    <script src="https://unpkg.com/react@15/dist/react.min.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script>
    <script defer>
      window.onload = () => {
        const h = React.createElement
        const ui = SwaggerUIBundle({
          url: window.location.href + '.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset, 
        system => {
            // Variable to capture the security prop of OperationSummary
            // then pass it to authorizeOperationBtn
            let currentSecurity
            return {
                wrapComponents: {
                    // Wrap OperationSummary component to get its prop
                    OperationSummary: Original => props => {
                        const security = props.operationProps.get('security')
                        currentSecurity = security.toJS()
                        return h(Original, props)
                    },
                    // Wrap the padlock button to show the
                    // scopes required for current operation
                    authorizeOperationBtn: Original =>
                        function (props) {
                            return h('div', {}, [
                                ...(currentSecurity || []).map(scheme => {
                                    const schemeName = Object.keys(scheme)[0]
                                    if (!scheme[schemeName].length) return null

                                    const scopes = scheme[schemeName].flatMap(scope => [
                                        h('code', null, scope),
                                        ', ',
                                    ])
                                    scopes.pop()
                                    return h('span', null, scopes)
                                }),
                                h(Original, props),
                            ])
                        },
                },
            }
        }],
          layout: 'StandaloneLayout',
        });
        window.ui = ui;
      };
    </script>
  </head>
  <body>
    <div id="swagger-ui"></div>
  </body>
</html>
`;
