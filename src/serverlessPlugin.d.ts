interface Serverless {
    cli: {
        log: Function;
    };
    service: ServerlessConfig;
}

interface ServerlessConfig {
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

interface ServerlessFunctions {
    [functionName: string]: ServerlessFunction;
}

interface ServerlessFunction {
    handler: string;
    name?: string;
    description?: string;
    runtime?: string;
    events?: ServerlessFunctionEvent[];
}

type ServerlessFunctionEvent = HttpEvent | HttpApiEvent;

type HttpEvent = FullHttpEvent | { http: string };

interface FullHttpEvent {
    http: {
        path: string;
        method: string;
        cors?: boolean | CorsConfig;
        swaggerTags?: string[];
        description?: string;
        responses?: HttpResponses;
        bodyType?: string;
        parameters?: {
            path?: { [key: string]: boolean };
            headers?: { [key: string]: boolean | { required: boolean; mappedValue: string } };
        };
    };
}

type HttpApiEvent = FullHttpApiEvent | { httpApi: string };
interface FullHttpApiEvent {
    httpApi: {
        path: string;
        method: string;
        swaggerTags?: string[];
        description?: string;
        responses?: HttpResponses;
        bodyType: string;
    };
}

interface HttpResponses {
    [statusCode: string]:
        | string
        | {
              description?: string;
              bodyType?: string;
          };
}

interface CorsConfig {}

interface ServerlessProvider {
    name: string;
    runtime: string;
    stage: string;
    region: string;
    profile: string;
    environment: { [key: string]: string };
}

interface ServerlessResources {
    [resourceName: string]: {
        type: string;
        properties: any;
    };
}

interface ServerlessOutputs {
    [key: string]: {
        Description: string;
        Value: string | { [key: string]: string | string[] };
        Export: {
            Name: string;
        };
    };
}

interface ServerlessOptions {}

interface ServerlessCommand {
    lifecycleEvents: string[];
    usage?: string;
}

interface ServerlessHooks {
    [hook: string]: Function;
}
