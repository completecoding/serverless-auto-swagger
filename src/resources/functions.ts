import { HttpApiEvent, Serverless, ServerlessFunction } from '../serverlessPlugin';

export default (serverless: Serverless): Record<string, ServerlessFunction> => {
  const handlerPath = 'swagger/';
  const configInput = serverless?.configurationInput || serverless.service;
  const path = serverless.service.custom?.autoswagger?.swaggerPath ?? 'swagger';
  const name = typeof configInput?.service == 'object' ? configInput.service.name : configInput.service;
  const stage = configInput?.provider?.stage;

  const useStage = serverless.service.custom?.autoswagger?.useStage;
  const apiType = serverless.service.custom?.autoswagger?.apiType ?? 'httpApi';

  if (!['http', 'httpApi'].includes(apiType)) {
    throw new Error(`[custom.autoswagger.apiType] must be "http" or "httpApi". Received: "${apiType}"`);
  }

  return {
    swaggerUI: {
      name: name && stage ? `${name}-${stage}-swagger-ui` : undefined,
      handler: handlerPath + 'swagger-html.handler',
      disableLogs: true,
      events: [
        {
          [apiType as 'httpApi']: {
            method: 'get',
            path: useStage ? `/${stage}/${path}` : `/${path}`,
          } as HttpApiEvent,
        },
      ],
    },

    swaggerJSON: {
      name: name && stage ? `${name}-${stage}-swagger-json` : undefined,
      handler: handlerPath + 'swagger-json.handler',
      disableLogs: true,
      events: [
        {
          [apiType as 'httpApi']: {
            method: 'get',
            path: useStage ? `/${stage}/${path}.json` : `/${path}.json`,
          } as HttpApiEvent,
        },
      ],
    },
  };
};
