'use strict';
import type { AwsLambdaRuntime } from '@serverless/typescript';
import { configSchemaHandler } from 'serverless';
import type {
  AwsFunctionHandler,
  Custom,
  Event,
  Functions,
  Http,
  HttpApiEvent,
  Provider,
  Serverless,
} from 'serverless/aws';
import type { HttpMethod } from './common.types';

export type CustomServerless = {
  cli?: { log: (text: string) => void }; // deprecated and replaced in v3.0.0
  service: ServerlessConfig;
  configSchemaHandler: configSchemaHandler;
  configurationInput: {
    service?: Serverless['service']; // I think { name: string } is for v2 compatibility?
    provider?: Provider;
  };
};

// ws and wss are WebSocket schemas
type SwaggerScheme = 'http' | 'https' | 'ws' | 'wss';

export type ApiType = 'http' | 'httpApi';

export interface AutoSwaggerCustomConfig {
  apiType?: ApiType;
  apiKeyHeaders?: string[];
  swaggerFiles?: string[];
  generateSwaggerOnDeploy?: boolean;
  typefiles?: string[];
  useStage?: boolean;
  swaggerPath?: string;
  basePath?: string;
  schemes?: SwaggerScheme[];
  excludeStages?: string[];
}

export type CustomWithAutoSwagger = Custom & { autoswagger?: AutoSwaggerCustomConfig };

export interface ServerlessConfig extends Serverless {
  functions?: ServerlessFunctions;
  custom?: CustomWithAutoSwagger;
}

export interface ServerlessFunctions extends Functions {
  [functionName: string]: ServerlessFunction;
}

export interface ServerlessFunction extends AwsFunctionHandler {
  runtime?: AwsLambdaRuntime;
  events?: ServerlessFunctionEvent[];
}

export type ServerlessFunctionEvent =
  | { http: CustomHttpEvent; httpApi?: never }
  | { http?: never; httpApi: CustomHttpApiEvent }
  | ({ http?: never; httpApi?: never } & Event);

export type QueryStringParameters = Record<
  string,
  {
    required?: boolean;
    type: 'string' | 'integer' | 'array';
    description?: string;
    minimum?: number;
    arrayItemsType?: string;
  }
>;

export type HeaderParameters = Record<
  string,
  {
    required?: boolean;
    type: 'string' | 'integer';
    description?: string;
    minimum?: number;
  }
>;

type SimplePath = Record<string, boolean>;
type PathWithDescription = Record<string, { required?: boolean; description?: string }>;
export type PathParameterPath = SimplePath | PathWithDescription;

export type PathParameters = {
  path?: PathParameterPath;
  headers?: Record<string, boolean | { required: boolean; mappedValue: string }>;
};

export interface CustomHttpEvent extends Http {
  method: Uppercase<HttpMethod> | Lowercase<HttpMethod>;
  swaggerTags?: string[];
  produces?: string[];
  consumes?: string[];
  summary?: string;
  description?: string;
  responseData?: HttpResponses;
  responses?: HttpResponses; // Ideally don't use as it conflicts with serverless offline
  exclude?: boolean;
  bodyType?: string;
  headerParameters?: HeaderParameters;
  queryStringParameters?: QueryStringParameters;
}

export interface CustomHttpApiEvent extends HttpApiEvent {
  method: Lowercase<HttpMethod> | Uppercase<HttpMethod>;
  swaggerTags?: string[];
  produces?: string[];
  consumes?: string[];
  description?: string;
  summary?: string;
  responseData?: HttpResponses;
  responses?: HttpResponses; // Ideally don't use as it conflicts with serverless offline
  exclude?: boolean;
  bodyType?: string;
  headerParameters?: string;
  queryStringParameterType?: string;
}

export interface HttpResponses {
  [statusCode: string]:
    | string
    | {
        description?: string;
        bodyType?: string;
      };
}

export interface ServerlessCommand {
  lifecycleEvents: string[];
  usage?: string;
}

export type ServerlessHooks = Record<string, () => Promise<void>>;
