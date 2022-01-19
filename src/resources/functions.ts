import { ServerlessFunction, Serverless } from '../serverlessPlugin';

export default (serverless: Serverless) => {
    const handlerPath = 'swagger/';
    const path = serverless.service.custom?.autoswagger?.swaggerPath ?? 'swagger';
    const name = serverless.configurationInput?.service?.name;
    const stage = serverless.configurationInput?.provider?.stage;
    return {
        swaggerUI: {
            name: name && stage ? `${name}-${stage}-swaggerUI` : undefined,
            handler: handlerPath + 'html.handler',
            disableLogs: true,
            events: [
                {
                    http: {
                        method: 'get',
                        path,
                        cors: true,
                    },
                },
            ],
        },

        swaggerJSON: {
            name: name && stage ? `${name}-${stage}-swaggerJSON` : undefined,
            handler: handlerPath + 'json.handler',
            disableLogs: true,
            events: [
                {
                    http: {
                        method: 'get',
                        path: `${path}.json`,
                        cors: true,
                    },
                },
            ],
        },
    } as Record<string, ServerlessFunction>;
};
