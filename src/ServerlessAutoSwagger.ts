'use strict';
import * as fs from 'fs-extra';
import { getOpenApiWriter, getTypeScriptReader, makeConverter } from 'typeconv';
import { removeStringFromArray, writeFile } from './helperFunctions';
import swaggerFunctions from './resources/functions';
import {
  HttpApiEvent,
  HttpApiEventOrString,
  HttpEvent,
  HttpEventOrString,
  HttpMethod,
  HttpResponses,
  Serverless,
  ServerlessCommand,
  ServerlessHooks,
  ServerlessOptions,
} from './serverlessPlugin';
import { Definition, MethodSecurity, Parameter, Response, SecurityDefinition, Swagger } from './swagger';

class ServerlessAutoSwagger {
  serverless: Serverless;
  options: ServerlessOptions;
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

  commands: Record<string, ServerlessCommand> = {};
  hooks: ServerlessHooks = {};

  constructor(serverless: Serverless, options: ServerlessOptions) {
    this.serverless = serverless;
    this.options = options;

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
    this.serverless.configSchemaHandler?.defineFunctionEventProperties('aws', 'http', {
      properties: {
        exclude: {
          type: 'boolean',
          nullable: true,
        },
        swaggerTags: {
          type: 'array',
          nullable: true,
          items: { type: 'string' },
        },
        responses: {
          type: 'object',
          nullable: true,
          additionalProperties: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'object',
                required: [],
                properties: {
                  description: {
                    type: 'string',
                  },
                  bodyType: {
                    type: 'string',
                  },
                },
              },
            ],
          },
        },
        headerParameters: {
          type: 'object',
          nullable: true,
          required: [],
          additionalProperties: {
            type: 'object',
            required: ['required', 'type'],
            properties: {
              required: {
                type: 'boolean',
              },
              type: {
                type: 'string',
                enum: ['string', 'integer'],
              },
              description: {
                type: 'string',
                nullable: true,
              },
              minimum: {
                type: 'number',
                nullable: true,
              },
            },
          },
        },
        queryStringParameters: {
          type: 'object',
          nullable: true,
          required: [],
          additionalProperties: {
            type: 'object',
            required: ['required', 'type'],
            properties: {
              required: {
                type: 'boolean',
              },
              type: {
                type: 'string',
                enum: ['string', 'integer'],
              },
              description: {
                type: 'string',
                nullable: true,
              },
              minimum: {
                type: 'number',
                nullable: true,
              },
              arrayItemsType: {
                type: 'number',
                nullable: true,
              },
            },
          },
        },
      },
      required: [],
    });
  };

  preDeploy = async () => {
    const stage = this.serverless.service.provider.stage as string;
    const excludedStages = this.serverless.service.custom?.autoswagger?.excludeStages;
    if (excludedStages?.includes(stage)) {
      console.log(`Swagger lambdas will not be deployed for stage [${stage}], as they have been marked for exclusion.`);
      return;
    }
    const generateSwaggerOnDeploy = this.serverless.service.custom?.autoswagger?.generateSwaggerOnDeploy;
    if (generateSwaggerOnDeploy === undefined || generateSwaggerOnDeploy) {
      await this.generateSwagger();
    }

    this.addEndpointsAndLambda();
  };

  /** Updates this.swagger with serverless custom.autoswagger overrides */
  gatherSwaggerOverrides = (): void => {
    const autoswagger = this.serverless.service.custom?.autoswagger ?? {};

    if (autoswagger.basePath) this.swagger.basePath = autoswagger.basePath;
    if (autoswagger.schemes) this.swagger.schemes = autoswagger.schemes;

    // There must be at least one or this `if` will be false
    if (autoswagger.swaggerFiles?.length) this.gatherSwaggerFiles(autoswagger.swaggerFiles);
  };

  /** Updates this.swagger with swagger file overrides */
  gatherSwaggerFiles = (swaggerFiles: string[]): void => {
    swaggerFiles.forEach((filepath) => {
      const fileData = fs.readFileSync(filepath, 'utf8');

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
    this.swagger.info.title = this.serverless.service.service;

    const reader = getTypeScriptReader();
    const writer = getOpenApiWriter({
      format: 'json',
      title: this.serverless.service.service,
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
            const fileData = fs.readFileSync(filepath, 'utf8');

            const { data } = await convert({ data: fileData });
            // change the #/components/schema to #/definitions
            const definitionsData = data.replace(/\/components\/schemas/g, '/definitions');

            const definitions: Record<string, Definition> = JSON.parse(definitionsData).components.schemas;

            if (data.includes('anyOf')) {
              // anyOf caused some issues with certain swagger configs
              console.log('includes anyOf');
              // const newDef = Object.values(definition).map(recursiveFixAnyOf);
            }

            this.swagger.definitions = {
              ...this.swagger.definitions,
              ...definitions,
            };
          } catch (error) {
            console.log(`couldn't read types from file: ${filepath}`);
            return;
          }
        })
      );
      // TODO change this to store these as temporary and only include definitions used elsewhere.
    } catch (error) {
      this.serverless.cli.log('unable to get types', error);
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
    this.gatherSwaggerOverrides();
    await this.gatherTypes();
    this.generateSecurity();
    this.generatePaths();

    this.serverless.cli.log(`Creating your Swagger File now`);

    // TODO enable user to specify swagger file path. also needs to update the swagger json endpoint.
    await fs.copy('./node_modules/serverless-auto-swagger/dist/resources', './swagger');

    if (this.serverless.service.provider.runtime?.includes('python')) {
      const swaggerStr = JSON.stringify(this.swagger, null, 2)
        .replace(/true/g, 'True')
        .replace(/false/g, 'False')
        .replace(/null/g, 'None');
      let swaggerPythonString = `# this file was generated by serverless-auto-swagger`;
      swaggerPythonString += `\ndocs = ${swaggerStr}`;
      await writeFile('./swagger/swagger.py', swaggerPythonString);
    } else {
      await fs.copy('./node_modules/serverless-auto-swagger/dist/resources', './swagger', {
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
      ...swaggerFunctions(this.serverless),
    };
  };

  addSwaggerPath = (functionName: string, http: EitherHttpEvent | string) => {
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
      operationId: `${functionName}.${method}.${http.path}`,
      consumes: ['application/json'],
      produces: ['application/json'],
      // This is actually type `HttpEvent | HttpApiEvent`, but we can lie since only HttpEvent params (or shared params) are used
      parameters: this.httpEventToParameters(http as HttpEvent),
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
        .map((event) => (event as HttpEventOrString).http || (event as HttpApiEventOrString).httpApi)
        .filter((http) => !!http && typeof http !== 'string' && !http.exclude)
        .forEach((http) => this.addSwaggerPath(functionName, http));
    });
  };

  formatResponses = (responseData: HttpResponses | undefined) => {
    if (!responseData) {
      // could throw error
      return {
        200: {
          description: '200 response',
        },
      };
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

  pathToParam = (pathParam: string, required = true): Parameter => ({
    name: pathParam,
    in: 'path',
    required,
    type: 'string',
  });

  // The arg is actually type `HttpEvent | HttpApiEvent`, but we only use it if it has httpEvent props (or shared props),
  //  so we can lie to the compiler to make typing simpler
  httpEventToParameters = (httpEvent: HttpEvent): Parameter[] => {
    const parameters: Parameter[] = [];

    if (httpEvent.bodyType) {
      parameters.push({
        in: 'body',
        name: 'body',
        description: 'Body required in the request',
        required: true,
        schema: {
          $ref: `#/definitions/${httpEvent.bodyType}`,
        },
      });
    }

    if (httpEvent.parameters?.path) {
      const match = httpEvent.path.match(/[^{}]+(?=})/g);
      let pathParameters = match ?? [];

      if (!match) {
        const rawPathParams = httpEvent.parameters.path;

        Object.entries(rawPathParams).forEach(([param, required]) => {
          parameters.push(this.pathToParam(param, required));
          pathParameters = removeStringFromArray(pathParameters, param);
        });
      }

      pathParameters.forEach((param) => parameters.push(this.pathToParam(param)));
    }

    if (httpEvent.headerParameters) {
      const rawHeaderParams = httpEvent.headerParameters;
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

    if (httpEvent.queryStringParameters) {
      const rawQueryParams = httpEvent.queryStringParameters;
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

type EitherHttpEvent = HttpEvent | HttpApiEvent;

export default ServerlessAutoSwagger;