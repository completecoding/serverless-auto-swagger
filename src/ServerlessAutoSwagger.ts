'use strict';
import { getTypeScriptReader, getOpenApiWriter, makeConverter } from 'typeconv';
import swaggerFunctions from './resources/functions';
import * as fs from 'fs-extra';

import {
    Serverless,
    ServerlessOptions,
    ServerlessCommand,
    ServerlessHooks,
    HttpEvent,
    HttpApiEvent,
    HttpResponses,
    FullHttpEvent,
    FullHttpApiEvent,
} from './serverlessPlugin';
import { Swagger, Definition, Response } from './swagger';
import { removeStringFromArray, writeFile } from './helperFunctions';

class ServerlessAutoSwagger {
    serverless: Serverless;
    options: ServerlessOptions;
    swagger: Swagger = {
        swagger: '2.0',
        info: {
            title: '',
            version: '1',
        },
        schemes: ['https'],
        paths: {},
        definitions: {},
    };

    commands: { [key: string]: ServerlessCommand } = {};
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
            'before:offline:start:init': this.predeploy,
            'before:package:cleanup': this.predeploy,
        };
    }


    registerOptions = () => {
        this.serverless.configSchemaHandler.defineFunctionEventProperties('aws', 'http', {
            properties: {
                exclude: {
                    type: 'boolean',
                    nullable: true,
                    defaultValue: false
                },
                swaggerTags: {
                    type: 'array',
                    nullable: true,
                    items: {type: 'string'}
                },
                responses: {
                    type: 'object',
                    nullable: true,
                    additionalProperties: {
                        anyOf: [
                            {
                                type: 'string'
                            },
                            {
                                type: 'object',
                                required: [],
                                properties: {
                                    description: {
                                        type: 'string'
                                    },
                                    bodyType: {
                                        type: 'string'
                                    }
                                }
                            }
                        ]
                    }
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
                                enum: ['string', 'integer']
                            },
                            description: {
                                type: 'string',
                                nullable: true
                            },
                            minimum: {
                                type: 'number',
                                nullable: true
                            }
                        }
                    }
                }
            },
            required: [],
        });
    };

    predeploy = async () => {
        const generateSwaggerOnDeploy =
            this.serverless.service.custom?.autoswagger?.generateSwaggerOnDeploy;
        if (generateSwaggerOnDeploy === undefined || generateSwaggerOnDeploy) {
            await this.generateSwagger();
        }

        this.addEndpointsAndLambda();
    };

    gatherSwaggerFiles = async () => {
        const swaggerFiles = this.serverless.service.custom?.autoswagger
            ?.swaggerFiles as string[];

        if (!swaggerFiles || swaggerFiles.length < 1) {
            return;
        }

        await Promise.all(swaggerFiles.map(async (filepath) => {
            const fileData = fs.readFileSync(filepath, 'utf8');

            const jsonData = JSON.parse(fileData);


            const { paths = {}, definitions = {}, ...swagger } = jsonData;


            this.swagger = {
                ...this.swagger,
                ...swagger,
                paths: {
                    ...this.swagger.paths,
                    ...paths,
                },
                definitions: {
                    ...this.swagger.definitions,
                    ...definitions,
                }
            };
        }));
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
            const typeLocationOverride = this.serverless.service.custom?.autoswagger
                ?.typefiles as string[];
            const typesFile = typeLocationOverride || ['./src/types/api-types.d.ts'];
            await Promise.all(
                typesFile.map(async filepath => {
                    try {
                        const fileData = fs.readFileSync(filepath, 'utf8');

                        const { data } = await convert({ data: fileData });
                        // change the #/components/schema to #/definitions
                        const definitionsData = data.replace(
                            /\/components\/schemas/g,
                            '/definitions'
                        );

                        const definitions: { [key: string]: Definition } =
                            JSON.parse(definitionsData).components.schemas;

                        if (data.includes('anyOf')) {
                            // anyOf caused some issues with certain swagger configs
                            console.log('includes anyOf');
                            //const newDef = Object.values(definition).map(recursiveFixAnyOf);
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

    generateSwagger = async () => {
        await this.gatherSwaggerFiles();
        await this.gatherTypes();

        this.generatePaths();
        
        this.serverless.cli.log(`Creating your Swagger File now`);

        // TODO enable user to specify swagger file path. also needs to update the swagger json endpoint.

        await fs.copy('./node_modules/serverless-auto-swagger/dist/resources', './swagger');
        if (this.serverless.service.provider.runtime.includes('python')) {
            const swaggerPythonString = `# this file was generated by serverless-auto-swagger
docs = ${JSON.stringify(this.swagger, null, 2)}`
            await writeFile('./swagger/swagger.py', swaggerPythonString);
        } else {
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

    generatePaths = () => {
        const functions = this.serverless.service.functions;
        Object.entries(functions).map(([functionName, config]) => {
            const events = config.events || [];
            events
                .filter(event => {
                    if (!((event as HttpEvent).http || (event as HttpApiEvent).httpApi)) {
                        return false;
                    }

                    const http = (event as HttpEvent).http || (event as HttpApiEvent).httpApi;

                    if (typeof http === 'string') {
                        return false;
                    }

                    return !http.exclude;
                })
                .map(event => {
                    let http = (event as HttpEvent).http || (event as HttpApiEvent).httpApi;
                    if (typeof http === 'string') {
                        // TODO they're using the shorthand - parse that into object.
                        return;
                    }

                    let path = http.path;
                    if (path[0] !== '/') path = `/${path}`;

                    if (!this.swagger.paths[path]) {
                        this.swagger.paths[path] = {};
                    }

                    this.swagger.paths[path][http.method] = {
                        summary: functionName,
                        description: http.description || '',
                        tags: http.swaggerTags,
                        operationId: functionName,
                        consumes: ['application/json'],
                        produces: ['application/json'],
                        parameters: this.httpEventToParameters(http),
                        responses: this.formatResponses(http.responses),
                        security: this.httpEventToSecurity(http),
                    };
                });
        });
    };

    formatResponses = (responses: HttpResponses | undefined) => {
        if (!responses) {
            // could throw error
            return {
                200: {
                    description: '200 response',
                },
            };
        }
        const formatted: { [key: string]: Response } = {};
        Object.entries(responses).map(([statusCode, responseDetails]) => {
            if (typeof responseDetails == 'string') {
                formatted[statusCode] = {
                    description: responseDetails,
                };
                return;
            }
            let response: Response = {
                description: responseDetails.description || `${statusCode} response`,
            };
            if (responseDetails.bodyType) {
                response.schema = { $ref: `#/definitions/${responseDetails.bodyType}` };
            }

            formatted[statusCode] = response;
        });

        return formatted;
    };
    httpEventToSecurity = (http: EitherHttpEvent) => {
        // TODO - add security sections
        http.path;
        return undefined;
    };

    httpEventToParameters = (httpEvent: EitherHttpEvent) => {
        const parameters = [];
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
        if (
            !(httpEvent as FullHttpEvent['http']).parameters?.path &&
            httpEvent.path.match(/[^{\}]+(?=})/g)
        ) {
            const pathParameters = httpEvent.path.match(/[^{\}]+(?=})/g) || [];
            pathParameters.map(param => {
                parameters.push({
                    name: param,
                    in: 'path',
                    required: true,
                    type: 'string',
                });
            });
        }
        if ((httpEvent as FullHttpEvent['http']).parameters?.path) {
            const rawPathParams = (httpEvent as FullHttpEvent['http']).parameters?.path || {};
            let pathParameters = httpEvent.path.match(/[^{\}]+(?=})/g) || [];
            Object.entries(rawPathParams).map(([param, required]) => {
                parameters.push({
                    name: param,
                    in: 'path',
                    required,
                    type: 'string',
                });
                pathParameters = removeStringFromArray(pathParameters, param);
            });

            pathParameters.map(param => {
                parameters.push({
                    name: param,
                    in: 'path',
                    required: true,
                    type: 'string',
                });
            });
        }

        if ((httpEvent as FullHttpEvent['http']).queryStringParameters) {
            const rawQueryParams = (httpEvent as FullHttpEvent['http']).queryStringParameters!;
            Object.entries(rawQueryParams).map(([param, data]) => {
                parameters.push({
                    in: 'query',
                    name: param,
                    type: data.type || 'string',
                    description: data.description,
                });
            });
        }

        return parameters;
    };
}

type EitherHttpEvent = FullHttpEvent['http'] | FullHttpApiEvent['httpApi'];

export default ServerlessAutoSwagger;
