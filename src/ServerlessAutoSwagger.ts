'use strict';
import { copy, readFileSync } from 'fs-extra';
import { dirname } from 'path';
import type { Options } from 'serverless';
import type { Service } from 'serverless/aws';
import type { Logging } from 'serverless/classes/Plugin';
import { getOpenApiWriter, getTypeScriptReader, makeConverter } from 'typeconv';
import { generateEmptySwagger, writeFile } from './helperFunctions';
import swaggerFunctions from './resources/functions';
import * as customPropertiesSchema from './schemas/custom-properties.schema.json';
import * as functionEventPropertiesSchema from './schemas/function-event-properties.schema.json';
import type { HttpMethod } from './types/common.types';
import type {
  AutoSwaggerCustomConfig,
  CustomHttpApiEvent,
  CustomHttpEvent,
  CustomServerless,
  ServerlessCommands,
  ServerlessHooks,
} from './types/serverless-plugin.types';

import type { Definition, MethodSecurity, SecurityDefinition, Swagger } from './types/swagger.types';
import { formatResponses, httpEventToParameters, isHttpApiEvent, isHttpEvent } from './converters';

export default class ServerlessAutoSwagger {
  serverless: CustomServerless;
  autoSwaggerCustomConfig: AutoSwaggerCustomConfig;
  swagger: Swagger = generateEmptySwagger();
  options: Options;
  log: Logging['log'];
  commands: ServerlessCommands;
  hooks: ServerlessHooks;

  // IO is only injected in Serverless v3.0.0 (can experiment with `import { writeText, log, progress } from '@serverless/utils/log'; in a future PR)
  constructor(serverless: CustomServerless, options: Options, io?: Logging) {
    this.serverless = serverless;
    this.autoSwaggerCustomConfig = this.serverless.service.custom?.autoswagger || {};
    this.options = options;
    this.log = this.setupLogging(io);
    this.commands = this.getCustomCommands();
    this.hooks = this.getCustomLifecycleHooks();
    this.enrichServerlessSchema();
  }

  private getCustomLifecycleHooks(): ServerlessHooks {
    return {
      'generate-swagger:generateSwagger': this.generateSwagger,
      'before:offline:start:init': this.preDeploy,
      'before:package:cleanup': this.preDeploy,
    };
  }

  private getCustomCommands(): ServerlessCommands {
    return {
      'generate-swagger': {
        usage: 'Generates Swagger for your API',
        lifecycleEvents: ['generateSwagger'],
      },
    };
  }

  private setupLogging(io: Logging | undefined) {
    if (io?.log) return io.log;
    else
      return {
        notice: this.serverless.cli?.log ?? console.log,
        error: console.error,
      } as Logging['log'];
  }

  enrichServerlessSchema = () => {
    // TODO: Test custom properties configuration
    this.serverless.configSchemaHandler?.defineCustomProperties(customPropertiesSchema);
    this.serverless.configSchemaHandler?.defineFunctionEventProperties('aws', 'http', functionEventPropertiesSchema);
    this.serverless.configSchemaHandler?.defineFunctionEventProperties('aws', 'httpApi', functionEventPropertiesSchema);
  };

  preDeploy = async () => {
    const stage = this.serverless.service.provider.stage;
    const excludedStages = this.autoSwaggerCustomConfig.excludeStages;
    if (excludedStages && excludedStages.includes(stage!)) {
      this.log.notice(
        `Swagger lambdas will not be deployed for stage [${stage}], as it has been marked for exclusion.`
      );
      return;
    }

    const generateSwaggerOnDeploy = this.autoSwaggerCustomConfig.generateSwaggerOnDeploy ?? true;
    if (generateSwaggerOnDeploy) await this.generateSwagger();
    this.addEndpointsAndLambda();
  };

  generateSwagger = async () => {
    await this.gatherTypes();
    this.gatherSwaggerOverrides();
    this.generateSecurity();
    this.generatePaths();

    this.log.notice('Creating Swagger file...');
    const resourcesPath = await this.prepareResourceFolder();
    await this.writeSwaggerFile(resourcesPath);
  };

  /** Updates this.swagger with serverless custom.autoswagger overrides */
  gatherSwaggerOverrides = (): void => {
    const autoswagger = this.autoSwaggerCustomConfig;

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
      const typeLocationOverride = this.autoSwaggerCustomConfig.typefiles;

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
    const apiKeyHeaders = this.autoSwaggerCustomConfig.apiKeyHeaders;

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

  private async prepareResourceFolder() {
    // TODO enable user to specify swagger file path. also needs to update the swagger json endpoint.
    const packagePath = dirname(require.resolve('@archprotocol/serverless-auto-swagger/package.json'));
    const resourcesPath = `${packagePath}/dist/resources`;
    await copy(resourcesPath, './swagger');
    return resourcesPath;
  }

  private async writeSwaggerFile(resourcesPath: string) {
    if (this.isPythonRuntime()) {
      await this.writePythonSwaggerFile();
    } else {
      await this.writeJSSwaggerFile(resourcesPath);
    }
  }

  private isPythonRuntime() {
    return this.serverless.service.provider.runtime?.includes('python');
  }

  private async writePythonSwaggerFile() {
    const swaggerStr = JSON.stringify(this.swagger, null, 2)
      .replace(/true/g, 'True')
      .replace(/false/g, 'False')
      .replace(/null/g, 'None');
    let swaggerPythonString = `# this file was generated by serverless-auto-swagger`;
    swaggerPythonString += `\ndocs = ${swaggerStr}`;
    await writeFile('./swagger/swagger.py', swaggerPythonString);
  }
  private async writeJSSwaggerFile(resourcesPath: string) {
    await copy(resourcesPath, './swagger', {
      filter: (src) => src.slice(-2) === 'js',
    });

    const swaggerJavaScriptString = `// this file was generated by serverless-auto-swagger
            module.exports = ${JSON.stringify(this.swagger, null, 2)};`;
    await writeFile('./swagger/swagger.js', swaggerJavaScriptString);
  }

  addEndpointsAndLambda = () => {
    this.serverless.service.functions = {
      ...this.serverless.service.functions,
      ...swaggerFunctions(this.serverless),
    };
  };

  addSwaggerPath = (functionName: string, http: CustomHttpEvent | CustomHttpApiEvent) => {
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
      parameters: httpEventToParameters(http as CustomHttpEvent),
      responses: formatResponses(http.responseData ?? http.responses),
    };

    const apiKeyHeaders = this.autoSwaggerCustomConfig.apiKeyHeaders;

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
      events.forEach((event) => {
        if (isHttpEvent(event) && !event.http.exclude) {
          this.addSwaggerPath(functionName, event.http);
        } else if (isHttpApiEvent(event) && !event.httpApi.exclude) {
          this.addSwaggerPath(functionName, event.httpApi);
        }
      });
    });
  };
}
