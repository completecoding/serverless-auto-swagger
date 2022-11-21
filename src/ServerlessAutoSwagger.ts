'use strict';
import { copy, readFileSync } from 'fs-extra';
import { dirname } from 'path';
import type { Options } from 'serverless';
import type { Service } from 'serverless/aws';
import type { Logging } from 'serverless/classes/Plugin';
import { getOpenApiWriter, getTypeScriptReader, makeConverter } from 'typeconv';
import { removeStringFromArray, writeFile } from './helperFunctions';
import swaggerFunctions from './resources/functions';
import * as customPropertiesSchema from './schemas/custom-properties.schema.json';
import * as functionEventPropertiesSchema from './schemas/function-event-properties.schema.json';
import type { HttpMethod } from './types/common.types';
import type {
  CustomHttpApiEvent,
  CustomHttpEvent,
  CustomServerless,
  HeaderParameters,
  HttpResponses,
  PathParameterPath,
  PathParameters,
  QueryStringParameters,
  ServerlessCommand,
  ServerlessFunction,
  ServerlessHooks,
} from './types/serverless-plugin.types';

import type {
  Definition,
  MethodSecurity,
  Parameter,
  Response,
  SecurityDefinition,
  Swagger,
} from './types/swagger.types';

export default class ServerlessAutoSwagger {
  serverless: CustomServerless;
  options: Options;
  swagger: Swagger = {
    swagger: '2.0',
    info: {
      title: '',
      version: '1',
    },
    paths: {},
    definitions: {},
    securityDefinitions: {},
  };
  log: Logging['log'];

  commands: Record<string, ServerlessCommand> = {};
  hooks: ServerlessHooks = {};

  // IO is only injected in Serverless v3.0.0 (can experiment with `import { writeText, log, progress } from '@serverless/utils/log'; in a future PR)
  constructor(serverless: CustomServerless, options: Options, io?: Logging) {
    this.serverless = serverless;
    this.options = options;

    if (io?.log) this.log = io.log;
    else
      this.log = {
        notice: this.serverless.cli?.log ?? console.log,
        error: console.error,
      } as Logging['log'];

    this.registerOptions();

    this.commands = {
      'generate-swagger': {
        usage: 'Generates Swagger for your API',
        lifecycleEvents: ['generateSwagger'],
      },
    };

    this.hooks = {
      'generate-swagger:generateSwagger': this.generateSwagger,
      'before:offline:start:init': this.preDeploy,
      'before:package:cleanup': this.preDeploy,
    };
  }

  registerOptions = () => {
    // TODO: Test custom properties configuration
    this.serverless.configSchemaHandler?.defineCustomProperties(customPropertiesSchema);
    this.serverless.configSchemaHandler?.defineFunctionEventProperties('aws', 'http', functionEventPropertiesSchema);
    this.serverless.configSchemaHandler?.defineFunctionEventProperties('aws', 'httpApi', functionEventPropertiesSchema);
  };

  preDeploy = async () => {
    const stage = this.serverless.service.provider.stage;
    const excludedStages = this.serverless.service.custom?.autoswagger?.excludeStages;
    if (excludedStages?.includes(stage!)) {
      this.log.notice(
        `Swagger lambdas will not be deployed for stage [${stage}], as it has been marked for exclusion.`
      );
      return;
    }

    const generateSwaggerOnDeploy = this.serverless.service.custom?.autoswagger?.generateSwaggerOnDeploy ?? true;
    if (generateSwaggerOnDeploy) await this.generateSwagger();
    this.addEndpointsAndLambda();
  };

  /** Updates this.swagger with serverless custom.autoswagger overrides */
  gatherSwaggerOverrides = (): void => {
    const autoswagger = this.serverless.service.custom?.autoswagger ?? {};

    if (autoswagger.basePath) this.swagger.basePath = autoswagger.basePath;
    if (autoswagger.host) this.swagger.host = autoswagger.host;
    if (autoswagger.schemes) this.swagger.schemes = autoswagger.schemes;
    if (autoswagger.title) this.swagger.info.title = autoswagger.title;
    if (autoswagger.description) this.swagger.info.description = autoswagger.description;
    if (autoswagger.version) this.swagger.info.version = autoswagger.version;

    // There must be at least one or this `if` will be false
    if (autoswagger.swaggerFiles?.length) this.gatherSwaggerFiles(autoswagger.swaggerFiles);
  };

  /** Updates this.swagger with swagger file overrides */
  gatherSwaggerFiles = (swaggerFiles: string[]): void => {
    swaggerFiles.forEach((filepath) => {
      const fileData = readFileSync(filepath, 'utf8');

      const jsonData = JSON.parse(fileData);

      const { paths = {}, definitions = {}, ...swagger } = jsonData;

      this.swagger = {
        ...this.swagger,
        ...swagger,
        paths: { ...this.swagger.paths, ...paths },
        definitions: { ...this.swagger.definitions, ...definitions },
      };
    });
  };

  gatherTypes = async () => {
    // get the details from the package.json? for info
    const service: string | Service = this.serverless.service.service;
    if (typeof service === 'string') this.swagger.info.title = service;
    else this.swagger.info.title = service.name;

    const reader = getTypeScriptReader();
    const writer = getOpenApiWriter({
      format: 'json',
      title: this.swagger.info.title,
      version: 'v1',
      schemaVersion: '2.0',
    });
    const { convert } = makeConverter(reader, writer);
    try {
      const typeLocationOverride = this.serverless.service.custom?.autoswagger?.typefiles;

      const typesFile = typeLocationOverride || ['./src/types/api-types.d.ts'];
      await Promise.all(
        typesFile.map(async (filepath) => {
          try {
            const fileData = readFileSync(filepath, 'utf8');

            const { data } = await convert({ data: fileData });
            // change the #/components/schema to #/definitions
            const definitionsData = data.replace(/\/components\/schemas/g, '/definitions');

            const definitions: Record<string, Definition> = JSON.parse(definitionsData).components.schemas;

            // TODO: Handle `anyOf` in swagger configs

            this.swagger.definitions = {
              ...this.swagger.definitions,
              ...definitions,
            };
          } catch (error) {
            this.log.error(`Couldn't read types from file: ${filepath}`);
            return;
          }
        })
      );
      // TODO change this to store these as temporary and only include definitions used elsewhere.
    } catch (error) {
      this.log.error(`Unable to get types: ${error}`);
    }
  };

  generateSecurity = (): void => {
    const apiKeyHeaders = this.serverless.service.custom?.autoswagger?.apiKeyHeaders;

    if (apiKeyHeaders?.length) {
      const securityDefinitions: Record<string, SecurityDefinition> = {};
      apiKeyHeaders.forEach((indexName) => {
        securityDefinitions[indexName] = {
          type: 'apiKey',
          name: indexName,
          in: 'header',
        };
      });

      this.swagger = { ...this.swagger, securityDefinitions };
    }

    // If no apiKeyHeaders are specified, we don't want to override any existing `securityDefinitions`
    //  that may be defined in a custom swagger json
  };

  generateSwagger = async () => {
    await this.gatherTypes();
    this.gatherSwaggerOverrides();
    this.generateSecurity();
    this.generatePaths();

    this.log.notice('Creating Swagger file...');

    // TODO enable user to specify swagger file path. also needs to update the swagger json endpoint.
    const packagePath = dirname(require.resolve('serverless-auto-swagger/package.json'));
    const resourcesPath = `${packagePath}/dist/resources`;
    await copy(resourcesPath, './swagger');

    if (this.serverless.service.provider.runtime?.includes('python')) {
      const swaggerStr = JSON.stringify(this.swagger, null, 2)
        .replace(/true/g, 'True')
        .replace(/false/g, 'False')
        .replace(/null/g, 'None');
      let swaggerPythonString = `# this file was generated by serverless-auto-swagger`;
      swaggerPythonString += `\ndocs = ${swaggerStr}`;
      await writeFile('./swagger/swagger.py', swaggerPythonString);
    } else {
      await copy(resourcesPath, './swagger', {
        filter: (src) => src.slice(-2) === 'js',
      });

      const swaggerJavaScriptString = `// this file was generated by serverless-auto-swagger
            module.exports = ${JSON.stringify(this.swagger, null, 2)};`;
      await writeFile('./swagger/swagger.js', swaggerJavaScriptString);
    }
  };

  addEndpointsAndLambda = () => {
    this.serverless.service.functions = {
      ...this.serverless.service.functions,
      ...Object.entries(swaggerFunctions(this.serverless))
        .filter(([_key, value]) => value)
        .reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value as ServerlessFunction,
          }),
          {}
        ),
    };
  };

  addSwaggerPath = (functionName: string, http: CustomHttpEvent | CustomHttpApiEvent | string) => {
    if (typeof http === 'string') {
      // TODO they're using the shorthand - parse that into object.
      //  You'll also have to remove the `typeof http !== 'string'` check from the function calling this one
      return;
    }

    let path = http.path;
    if (path[0] !== '/') path = `/${path}`;
    this.swagger.paths[path] ??= {};

    const method = http.method.toLowerCase() as Lowercase<HttpMethod>;

    this.swagger.paths[path][method] = {
      summary: http.summary || functionName,
      description: http.description ?? '',
      tags: http.swaggerTags,
      operationId: http.operationId || `${functionName}.${method}.${http.path}`,
      consumes: http.consumes ?? ['application/json'],
      produces: http.produces ?? ['application/json'],
      security: http.security,
      // This is actually type `HttpEvent | HttpApiEvent`, but we can lie since only HttpEvent params (or shared params) are used
      parameters: this.httpEventToParameters(http as CustomHttpEvent),
      responses: this.formatResponses(http.responseData ?? http.responses),
    };

    const apiKeyHeaders = this.serverless.service.custom?.autoswagger?.apiKeyHeaders;

    const security: MethodSecurity[] = [];

    if (apiKeyHeaders?.length) {
      security.push(
        apiKeyHeaders.reduce((acc, indexName: string) => ({ ...acc, [indexName]: [] }), {} as MethodSecurity)
      );
    }

    if (security.length) {
      this.swagger.paths[path][method]!.security = security;
    }
  };

  generatePaths = () => {
    const functions = this.serverless.service.functions ?? {};
    Object.entries(functions).forEach(([functionName, config]) => {
      const events = config.events ?? [];
      events
        .map((event) => event.http || event.httpApi)
        .filter((http) => !!http && typeof http !== 'string' && !http.exclude)
        .forEach((http) => this.addSwaggerPath(functionName, http!));
    });
  };

  formatResponses = (responseData: HttpResponses | undefined) => {
    if (!responseData) {
      // could throw error
      return { 200: { description: '200 response' } };
    }
    const formatted: Record<string, Response> = {};
    Object.entries(responseData).forEach(([statusCode, responseDetails]) => {
      if (typeof responseDetails == 'string') {
        formatted[statusCode] = {
          description: responseDetails,
        };
        return;
      }
      const response: Response = { description: responseDetails.description || `${statusCode} response` };
      if (responseDetails.bodyType) {
        response.schema = { $ref: `#/definitions/${responseDetails.bodyType}` };
      }

      formatted[statusCode] = response;
    });

    return formatted;
  };

  // httpEventToSecurity = (http: EitherHttpEvent) => {
  //   // TODO - add security sections
  //   return undefined
  // }

  pathToParam = (pathParam: string, paramInfoOrRequired?: PathParameterPath[string]): Parameter => {
    const isObj = typeof paramInfoOrRequired === 'object';
    const required = (isObj ? paramInfoOrRequired.required : paramInfoOrRequired) ?? true;

    return {
      name: pathParam,
      in: 'path',
      required,
      description: isObj ? paramInfoOrRequired.description : undefined,
      type: 'string',
    };
  };

  // The arg is actually type `HttpEvent | HttpApiEvent`, but we only use it if it has httpEvent props (or shared props),
  //  so we can lie to the compiler to make typing simpler
  httpEventToParameters = (httpEvent: CustomHttpEvent): Parameter[] => {
    const parameters: Parameter[] = [];

    if (httpEvent.bodyType) {
      parameters.push({
        in: 'body',
        name: 'body',
        description: 'Body required in the request',
        required: true,
        schema: { $ref: `#/definitions/${httpEvent.bodyType}` },
      });
    }

    const rawPathParams: PathParameters['path'] = httpEvent.request?.parameters?.paths;
    const match = httpEvent.path.match(/[^{}]+(?=})/g);
    let pathParameters = match ?? [];

    if (rawPathParams) {
      Object.entries(rawPathParams ?? {}).forEach(([param, paramInfo]) => {
        parameters.push(this.pathToParam(param, paramInfo));
        pathParameters = removeStringFromArray(pathParameters, param);
      });
    }

    // If no match, will just be [] anyway
    pathParameters.forEach((param: string) => parameters.push(this.pathToParam(param)));

    if (httpEvent.headerParameters || httpEvent.request?.parameters?.headers) {
      // If no headerParameters are provided, try to use the builtin headers
      const rawHeaderParams: HeaderParameters =
        httpEvent.headerParameters ??
        Object.entries(httpEvent.request!.parameters!.headers!).reduce(
          (acc, [name, required]) => ({ ...acc, [name]: { required, type: 'string' } }),
          {}
        );

      Object.entries(rawHeaderParams).forEach(([param, data]) => {
        parameters.push({
          in: 'header',
          name: param,
          required: data.required ?? false,
          type: data.type ?? 'string',
          description: data.description,
        });
      });
    }

    if (httpEvent.queryStringParameters || httpEvent.request?.parameters?.querystrings) {
      // If no queryStringParameters are provided, try to use the builtin query strings
      const rawQueryParams: QueryStringParameters =
        httpEvent.queryStringParameters ??
        Object.entries(httpEvent.request!.parameters!.querystrings!).reduce(
          (acc, [name, required]) => ({ ...acc, [name]: { required, type: 'string' } }),
          {}
        );

      Object.entries(rawQueryParams).forEach(([param, data]) => {
        parameters.push({
          in: 'query',
          name: param,
          type: data.type ?? 'string',
          description: data.description,
          required: data.required ?? false,
          ...(data.type === 'array'
            ? {
                items: { type: data.arrayItemsType },
                collectionFormat: 'multi',
              }
            : {}),
        });
      });
    }

    return parameters;
  };
}
