import ServerlessAutoSwagger from '../src/ServerlessAutoSwagger';
import { FullHttpEvent, Serverless } from '../src/serverlessPlugin';
import * as fs from 'fs-extra';
import { PathOrFileDescriptor } from 'fs-extra';

const generateServerlessFromAnEndpoint = (
    events: FullHttpEvent[],
    autoswaggerOptions = {}
): Serverless => {
    const serviceDetails = {
        service: '',
        provider: {
            name: '',
            runtime: '',
            stage: '',
            region: '',
            profile: '',
            environment: {},
        },
        plugins: [],
        functions: {
            mocked: {
                handler: 'mocked.handler',
                events,
            },
        },
        custom: {
            autoswagger: autoswaggerOptions,
        },
    };

    return {
        cli: { log: () => {} },
        service: serviceDetails,
        configurationInput: serviceDetails,
        configSchemaHandler: {
            defineCustomProperties: (schema: unknown) => {},
            defineFunctionEvent: (
                provider: string,
                event: string,
                schema: Record<string, unknown>
            ) => {},
            defineFunctionEventProperties: (
                provider: string,
                existingEvent: string,
                schema: unknown
            ) => {},
            defineFunctionProperties: (provider: string, schema: unknown) => {},
            defineProvider: (provider: string, options?: Record<string, unknown>) => {},
            defineTopLevelProperty: (provider: string, schema: Record<string, unknown>) => {},
        },
    };
};

describe('ServerlessAutoSwagger', () => {
    describe('generatePaths', () => {
        it('should generate minimal endpoint', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint([
                    {
                        http: {
                            path: 'hello',
                            method: 'post',
                        },
                    },
                ]),
                {}
            );
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                '/hello': {
                    post: {
                        summary: 'mocked',
                        description: '',
                        operationId: 'mocked',
                        tags: undefined,
                        consumes: ['application/json'],
                        produces: ['application/json'],
                        parameters: [],
                        responses: {
                            200: {
                                description: '200 response',
                            },
                        },
                    },
                },
            });
        });

        it('should generate an endpoint with a description', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint([
                    {
                        http: {
                            path: 'hello',
                            method: 'post',
                            description: 'I like documentation',
                        },
                    },
                ]),
                {}
            );
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                '/hello': {
                    post: {
                        summary: 'mocked',
                        description: 'I like documentation',
                        operationId: 'mocked',
                        tags: undefined,
                        consumes: ['application/json'],
                        produces: ['application/json'],
                        parameters: [],
                        responses: {
                            200: {
                                description: '200 response',
                            },
                        },
                    },
                },
            });
        });

        it('should generate an endpoint with a response', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint([
                    {
                        http: {
                            path: 'hello',
                            method: 'post',
                            responses: {
                                // response with description and response body
                                200: {
                                    description: 'this went well',
                                    bodyType: 'helloPostResponse',
                                },
                                // response with just a description
                                400: {
                                    description: 'failed Post',
                                },
                                // shorthand for just a description
                                502: 'server error',
                            },
                        },
                    },
                ]),
                {}
            );
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                '/hello': {
                    post: {
                        summary: 'mocked',
                        description: '',
                        operationId: 'mocked',
                        consumes: ['application/json'],
                        produces: ['application/json'],
                        parameters: [],
                        tags: undefined,
                        responses: {
                            200: {
                                description: 'this went well',
                                schema: {
                                    $ref: '#/definitions/helloPostResponse',
                                },
                            },
                            400: {
                                description: 'failed Post',
                            },
                            502: {
                                description: 'server error',
                            },
                        },
                    },
                },
            });
        });

        it('should generate an endpoint with query parameters', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint([
                    {
                        http: {
                            path: 'goodbye',
                            method: 'get',
                            queryStringParameters: {
                                bob: {
                                    required: true,
                                    type: 'string',
                                    description: 'bob',
                                },
                                count: {
                                    required: false,
                                    type: 'integer',
                                },
                                foo: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                ]),
                {}
            );
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                '/goodbye': {
                    get: {
                        summary: 'mocked',
                        description: '',
                        tags: undefined,
                        operationId: 'mocked',
                        consumes: ['application/json'],
                        produces: ['application/json'],
                        parameters: [
                            {
                                name: 'bob',
                                type: 'string',
                                description: 'bob',
                                in: 'query',
                                required: true,
                            },
                            {
                                name: 'count',
                                type: 'integer',
                                in: 'query',
                                required: false,
                                description: undefined,
                            },
                            {
                                name: 'foo',
                                type: 'string',
                                in: 'query',
                                required: false,
                                description: undefined,
                            },
                        ],
                        responses: {
                            200: {
                                description: '200 response',
                            },
                        },
                    },
                },
            });
        });

        it('should generate an endpoint with header parameters', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
              generateServerlessFromAnEndpoint([
                  {
                      http: {
                          path: 'goodbye',
                          method: 'get',
                          headerParameters: {
                              bob: {
                                  required: true,
                                  type: 'string',
                                  description: 'bob',
                              },
                              count: {
                                  required: false,
                                  type: 'integer',
                              },
                              foo: {
                                  type: 'string',
                              },
                          },
                      },
                  },
              ]),
              {}
            );
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                '/goodbye': {
                    get: {
                        summary: 'mocked',
                        description: '',
                        tags: undefined,
                        operationId: 'mocked',
                        consumes: ['application/json'],
                        produces: ['application/json'],
                        parameters: [
                            {
                                name: 'bob',
                                type: 'string',
                                description: 'bob',
                                in: 'header',
                                required: true,
                            },
                            {
                                name: 'count',
                                type: 'integer',
                                in: 'header',
                                required: false,
                                description: undefined,
                            },
                            {
                                name: 'foo',
                                type: 'string',
                                in: 'header',
                                required: false,
                                description: undefined,
                            },
                        ],
                        responses: {
                            200: {
                                description: '200 response',
                            },
                        },
                    },
                },
            });
        });

        it('should filter an endpoint with exclude', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint([
                    {
                        http: {
                            path: 'hello',
                            method: 'post',
                            exclude: true,
                        },
                    },
                ]),
                {}
            );
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({});
        });

        it('should add path without remove existings', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint([
                    {
                        http: {
                            path: 'hello',
                            method: 'post',
                        },
                    },
                ]),
                {}
            );
            serverlessAutoSwagger.swagger.paths = {
                '/should': {
                    still: {
                        operationId: 'be here',
                        consumes: [],
                        produces: [],
                        parameters: [],
                        responses: {},
                    },
                },
            };

            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                '/should': {
                    still: {
                        operationId: 'be here',
                        consumes: [],
                        produces: [],
                        parameters: [],
                        responses: {},
                    },
                },
                '/hello': {
                    post: {
                        summary: 'mocked',
                        description: '',
                        tags: undefined,
                        operationId: 'mocked',
                        consumes: ['application/json'],
                        produces: ['application/json'],
                        parameters: [],
                        responses: {
                            200: {
                                description: '200 response',
                            },
                        },
                    },
                },
            });
        });
    });

    describe('gatherSwaggerFiles', () => {
        const mockedJsonFiles = new Map<string, string>();

        jest.spyOn(fs, 'readFileSync')
            .mockImplementation((fileName: PathOrFileDescriptor): string => {
                const content = mockedJsonFiles.get(fileName as string);

                if (!content) {
                    throw new Error(`file ${fileName} not mocked`);
                }

                return content;
            });

        const mockJsonFile = (fileName: string, content: Record<string, unknown>): void => {
            mockedJsonFiles.set(fileName, JSON.stringify(content));
        };

        beforeEach(() => {
            mockedJsonFiles.clear();
        });

        it('should add additionalProperties', async () => {
            mockJsonFile('test.json', {
                foo: {
                    bar: true,
                },
            });

            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint(
                    [
                        {
                            http: {
                                path: 'hello',
                                method: 'post',
                                exclude: true,
                            },
                        },
                    ],
                    {
                        swaggerFiles: ['test.json'],
                    }
                ),
                {}
            );

            await serverlessAutoSwagger.gatherSwaggerFiles();

            expect(serverlessAutoSwagger.swagger).toEqual({
                swagger: '2.0',
                info: { title: '', version: '1' },
                schemes: ['https'],
                paths: {},
                definitions: {},
                securityDefinitions: {},
                foo: { bar: true },
            });
        });

        it('should extend existing property', async () => {
            mockJsonFile('test.json', {
                schemes: ['http'],
            });
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint(
                    [
                        {
                            http: {
                                path: 'hello',
                                method: 'post',
                                exclude: true,
                            },
                        },
                    ],
                    {
                        swaggerFiles: ['test.json'],
                    }
                ),
                {}
            );

            await serverlessAutoSwagger.gatherSwaggerFiles();

            expect(serverlessAutoSwagger.swagger).toEqual({
                swagger: '2.0',
                info: { title: '', version: '1' },
                schemes: ['http'],
                paths: {},
                securityDefinitions: {},
                definitions: {},
            });
        });

        it('should cumulate files', async () => {
            mockJsonFile('foobar.json', {
                paths: {
                    '/foo': 'whatever',
                    '/bar': 'something else',
                },
                definitions: {
                    World: {
                        type: 'number',
                    },
                },
            });
            mockJsonFile('helloworld.json', {
                paths: {
                    '/hello': 'world',
                },
                definitions: {
                    Foo: {
                        type: 'string',
                    },
                    Bar: {
                        type: 'string',
                    },
                },
            });
            const serverlessAutoSwagger = new ServerlessAutoSwagger(
                generateServerlessFromAnEndpoint(
                    [
                        {
                            http: {
                                path: 'hello',
                                method: 'post',
                                exclude: true,
                            },
                        },
                    ],
                    {
                        swaggerFiles: ['helloworld.json', 'foobar.json'],
                    }
                ),
                {}
            );

            await serverlessAutoSwagger.gatherSwaggerFiles();

            expect(serverlessAutoSwagger.swagger).toEqual({
                swagger: '2.0',
                info: { title: '', version: '1' },
                schemes: ['https'],
                paths: {
                    '/foo': 'whatever',
                    '/bar': 'something else',
                    '/hello': 'world',
                },
                securityDefinitions: {},
                definitions: {
                    Foo: {
                        type: 'string',
                    },
                    Bar: {
                        type: 'string',
                    },
                    World: {
                        type: 'number',
                    },
                },
            });
        });
    });
});
