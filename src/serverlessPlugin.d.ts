export interface Serverless {
    cli: {
        log: Function;
    };
    service: ServerlessConfig;
}

export interface ServerlessConfig {
    service: string;
    provider: ServerlessProvider;
    plugins: string[];
    functions: ServerlessFunctions;
    resources?: {
        Resources?: ServerlessResources;
        Outputs?: ServerlessOutputs;
    };
    custom: { [key: string]: any };
}

export interface ServerlessFunctions {
    [functionName: string]: ServerlessFunction;
}

export interface ServerlessFunction {
    handler: string;
    name?: string;
    description?: string;
    runtime?: string;
    events?: ServerlessFunctionEvent[];
}

type ServerlessFunctionEvent = HttpEvent | HttpApiEvent;

type HttpEvent = FullHttpEvent | { http: string };

export interface FullHttpEvent {
    http: {
        path: string;
        method: string;
        cors?: boolean | CorsConfig;
        swaggerTags?: string[];
        description?: string;
        responses?: HttpResponses;
        bodyType?: string;
        queryStringParameters?: Record<
            string,
            {
                required: boolean;
                type: 'string' | 'integer';
                description?: string;
                minimum?: number;
            }
        >;
        parameters?: {
            path?: { [key: string]: boolean };
            headers?: { [key: string]: boolean | { required: boolean; mappedValue: string } };
        };
    };
}

type HttpApiEvent = FullHttpApiEvent | { httpApi: string };
export interface FullHttpApiEvent {
    httpApi: {
        path: string;
        method: string;
        swaggerTags?: string[];
        description?: string;
        responses?: HttpResponses;
        bodyType?: string;
        queryStringParameterType?: string;
    };
}

export interface HttpResponses {
    [statusCode: string]:
        | string
        | {
              description?: string;
              bodyType?: string;
          };
}

export interface CorsConfig {}

export interface ServerlessProvider {
    name: string;
    runtime: string;
    stage: string;
    region: string;
    profile: string;
    environment: { [key: string]: string };
}

export interface ServerlessResources {
    [resourceName: string]: {
        type: string;
        properties: any;
    };
}

export interface ServerlessOutputs {
    [key: string]: {
        Description: string;
        Value: string | { [key: string]: string | string[] };
        Export: {
            Name: string;
        };
    };
}

export interface ServerlessOptions {}

export interface ServerlessCommand {
    lifecycleEvents: string[];
    usage?: string;
}

export interface ServerlessHooks {
    [hook: string]: Function;
}
