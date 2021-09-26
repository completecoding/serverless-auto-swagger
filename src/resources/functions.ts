export default (() => {
    // will change for something that check if we are in .serverless_plugins or node modules
    const isDevelopment = true;
    const rootPath = isDevelopment ? '.serverless_plugins/' : 'node_modules/';
    const path = rootPath + 'serverless-auto-swagger/dist/resources/';

    return {
        swaggerUI: {
            handler: path + 'html.handler',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'swagger',
                        cors: true,
                    },
                },
            ],
        },

        swaggerJSON: {
            handler: path + 'json.handler',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'swagger.json',
                        cors: true,
                    },
                },
            ],
        },
    } as Record<string, ServerlessFunction>;
})();
