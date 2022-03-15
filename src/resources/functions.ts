'use strict';
import { ApiType, CustomServerless, ServerlessFunction } from '../types/serverless-plugin.types';

export default (serverless: CustomServerless): Record<'swaggerUI' | 'swaggerJSON', ServerlessFunction> => {
  const handlerPath = 'swagger/';
  const configInput = serverless?.configurationInput || serverless.service;
  const path = serverless.service.custom?.autoswagger?.swaggerPath ?? 'swagger';
  const name = typeof configInput?.service == 'object' ? configInput.service.name : configInput.service;
  const stage = configInput?.provider?.stage;

  const useStage = serverless.service.custom?.autoswagger?.useStage;
  const apiType: ApiType = serverless.service.custom?.autoswagger?.apiType ?? 'httpApi';

  if (!['http', 'httpApi'].includes(apiType)) {
    throw new Error(`custom.autoswagger.apiType must be "http" or "httpApi". Received: "${apiType}"`);
  }

  const swaggerUI: ServerlessFunction = {
    name: name && stage ? `${name}-${stage}-swagger-ui` : undefined,
    handler: handlerPath + 'swagger-html.handler',
    disableLogs: true,
    events: [
      {
        [apiType as 'httpApi']: {
          method: 'get' as const,
          path: useStage ? `/${stage}/${path}` : `/${path}`,
        },
      },
    ],
  };

  const swaggerJSON: ServerlessFunction = {
    name: name && stage ? `${name}-${stage}-swagger-json` : undefined,
    handler: handlerPath + 'swagger-json.handler',
    disableLogs: true,
    events: [
      {
        [apiType as 'httpApi']: {
          method: 'get' as const,
          path: useStage ? `/${stage}/${path}.json` : `/${path}.json`,
        },
      },
    ],
  };

  return { swaggerUI, swaggerJSON };
};
