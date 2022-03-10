import type { AWS, AwsLambdaRuntime, ServiceName } from '@serverless/typescript';

export interface Serverless {
  cli: {
    log(str: string, error?: unknown): void;
  };
  service: ServerlessConfig;
  configurationInput: {
    service?: ServiceName | { name?: string }; // I think { name: string } is for v2 compatibility?
    provider?: Pick<AWS['provider'], 'stage'>;
  };
  configSchemaHandler: {
    defineCustomProperties(schema: unknown): void;
    defineFunctionEvent(provider: string, event: string, schema: Record<string, unknown>): void;
    defineFunctionEventProperties(provider: string, existingEvent: string, schema: unknown): void;
    defineFunctionProperties(provider: string, schema: unknown): void;
    defineProvider(provider: string, options?: Record<string, unknown>): void;
    defineTopLevelProperty(provider: string, schema: Record<string, unknown>): void;
  };
}

// ws and wss are WebSocket schemas
type SwaggerScheme = 'http' | 'https' | 'ws' | 'wss';

type ApiType = 'http' | 'httpApi';

export interface AutoSwaggerCustomConfig {
  autoswagger?: {
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
  };
}

export interface ServerlessConfig extends AWS {
  service: string;
  provider: AWS['provider'];
  plugins?: AWS['plugins'];
  functions: ServerlessFunctions;
  resources?: {
    Resources?: ServerlessResources;
    Outputs?: ServerlessOutputs;
  };
  custom?: AWS['custom'] & AutoSwaggerCustomConfig;
}

export interface ServerlessFunctions extends AWS['functions'] {
  [functionName: string]: ServerlessFunction;
}

// AWS['functions']['functionName']
export interface ServerlessFunction {
  handler: string;
  name?: string;
  description?: string;
  disableLogs?: boolean;
  runtime?: AwsLambdaRuntime;
  events?: ServerlessFunctionEvent[];
}

export type ServerlessFunctionEvent = HttpEventOrString | HttpApiEventOrString;

type HttpEventOrString = { http: HttpEvent | string };

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch' | 'trace';

// AWS['functions']['functionName']['events']['http']
export interface HttpEvent {
  path: string;
  method: Uppercase<HttpMethod> | Lowercase<HttpMethod>;
  cors?: boolean | unknown;
  swaggerTags?: string[];
  summary?: string;
  description?: string;
  responseData?: HttpResponses;
  responses?: HttpResponses; // Ideally don't use as it conflicts with serverless offline
  exclude?: boolean;
  bodyType?: string;
  headerParameters?: Record<
    string,
    {
      required?: boolean;
      type: 'string' | 'integer';
      description?: string;
      minimum?: number;
    }
  >;
  queryStringParameters?: Record<
    string,
    {
      required?: boolean;
      type: 'string' | 'integer' | 'array';
      description?: string;
      minimum?: number;
      arrayItemsType?: string;
    }
  >;
  parameters?: {
    path?: Record<string, boolean>;
    headers?: Record<string, boolean | { required: boolean; mappedValue: string }>;
  };
}

type HttpApiEventOrString = { httpApi: HttpApiEvent | string };

// AWS['functions']['functionName']['events']['httpApi']
export interface HttpApiEvent {
  path: string;
  method: Uppercase<HttpMethod> | Lowercase<HttpMethod>;
  swaggerTags?: string[];
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

// AWS['resources']['Resources']
export interface ServerlessResources {
  [resourceName: string]: {
    Type: string;
    Properties: any;
  };
}

// AWS['resources']['Outputs']
export interface ServerlessOutputs {
  [key: string]: {
    Description: string;
    Value: string | Record<string, string | string[]>;
    Export: {
      Name: string;
    };
  };
}

export type ServerlessOptions = Record<string, never>;

export interface ServerlessCommand {
  lifecycleEvents: string[];
  usage?: string;
}

export type ServerlessHooks = Record<string, () => Promise<void>>;
