export interface Serverless {
  cli: {
    log: Function
  }
  service: ServerlessConfig
  configurationInput: {
    service?: string | { name?: string }
    provider?: {
      stage?: string
    }
  }
  configSchemaHandler: {
    defineCustomProperties(schema: unknown): void
    defineFunctionEvent(
      provider: string,
      event: string,
      schema: Record<string, unknown>
    ): void
    defineFunctionEventProperties(
      provider: string,
      existingEvent: string,
      schema: unknown
    ): void
    defineFunctionProperties(provider: string, schema: unknown): void
    defineProvider(provider: string, options?: Record<string, unknown>): void
    defineTopLevelProperty(
      provider: string,
      schema: Record<string, unknown>
    ): void
  }
}

export interface AutoSwaggerCustomConfig {
  autoswagger?: {
    apiKeyName?: string;
    swaggerFiles?: string[];
    generateSwaggerOnDeploy?: boolean;
    typefiles?: string[];
    useStage?: boolean;
    swaggerPath?: string;
  }
}

export interface ServerlessConfig {
  service: string
  provider: ServerlessProvider
  plugins: string[]
  functions: ServerlessFunctions
  resources?: {
    Resources?: ServerlessResources
    Outputs?: ServerlessOutputs
  }
  custom?: Record<string, any> & AutoSwaggerCustomConfig;
}

export interface ServerlessFunctions {
  [functionName: string]: ServerlessFunction
}

export interface ServerlessFunction {
  handler: string
  name?: string
  description?: string
  runtime?: string
  events?: ServerlessFunctionEvent[]
}

type ServerlessFunctionEvent = HttpEvent | HttpApiEvent

type HttpEvent = FullHttpEvent | { http: string }

export interface FullHttpEvent {
  http: {
    path: string
    method: string
    cors?: boolean | CorsConfig
    swaggerTags?: string[]
    summary?: string
    description?: string
    responseData?: HttpResponses
    responses?: HttpResponses // Ideally don't use as it conflicts with serverless offline
    exclude?: boolean
    bodyType?: string
    headerParameters?: Record<
      string,
      {
        required: boolean
        type: "string" | "integer"
        description?: string
        minimum?: number
      }
    >
    queryStringParameters?: Record<
      string,
      {
        required?: boolean
        type: "string" | "integer"
        description?: string
        minimum?: number
      }
    >
    parameters?: {
      path?: { [key: string]: boolean }
      headers?: {
        [key: string]: boolean | { required: boolean; mappedValue: string }
      }
    }
  }
}

type HttpApiEvent = FullHttpApiEvent | { httpApi: string }
export interface FullHttpApiEvent {
  httpApi: {
    path: string
    method: string
    swaggerTags?: string[]
    description?: string
    summary?: string
    responseData?: HttpResponses
    responses?: HttpResponses // Ideally don't use as it conflicts with serverless offline
    exclude?: boolean
    bodyType?: string
    headerParameters?: string
    queryStringParameterType?: string
  }
}

export interface HttpResponses {
  [statusCode: string]:
    | string
    | {
        description?: string
        bodyType?: string
      }
}

export interface CorsConfig {}

export interface ServerlessProvider {
  name: string
  runtime: string
  stage: string
  region: string
  profile: string
  environment: { [key: string]: string }
}

export interface ServerlessResources {
  [resourceName: string]: {
    type: string
    properties: any
  }
}

export interface ServerlessOutputs {
  [key: string]: {
    Description: string
    Value: string | { [key: string]: string | string[] }
    Export: {
      Name: string
    }
  }
}

export interface ServerlessOptions {}

export interface ServerlessCommand {
  lifecycleEvents: string[]
  usage?: string
}

export interface ServerlessHooks {
  [hook: string]: Function
}
