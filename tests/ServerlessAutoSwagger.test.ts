'use strict';
import * as fs from 'fs-extra';
import { PathOrFileDescriptor } from 'fs-extra';
import { Options } from 'serverless';
import { Logging } from 'serverless/classes/Plugin';
import ServerlessAutoSwagger from '../src/ServerlessAutoSwagger';
import { CustomServerless, ServerlessConfig, ServerlessFunctionEvent } from '../src/types/serverless-plugin.types';

const log = {
  notice: jest.fn(),
  error: jest.fn(),
  verbose: jest.fn(),
} as Partial<Logging['log']> as Logging['log'];

const logging: Logging = { log, writeText: () => undefined } as unknown as Logging;

const options: Options = {
  stage: 'test',
  region: 'local',
};

const generateServerlessFromAnEndpoint = (
  events: ServerlessFunctionEvent[],
  autoswaggerOptions = {}
): CustomServerless => {
  const serviceDetails: ServerlessConfig = {
    service: '',
    provider: {
      name: 'aws',
      runtime: undefined,
      stage: '',
      region: undefined,
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
    service: serviceDetails,
    configurationInput: serviceDetails,
    configSchemaHandler: {
      defineCustomProperties: () => undefined,
      defineFunctionEvent: () => undefined,
      defineFunctionEventProperties: () => undefined,
      defineFunctionProperties: () => undefined,
      defineProvider: () => undefined,
      defineTopLevelProperty: () => undefined,
    },
  };
};

describe('ServerlessAutoSwagger', () => {
  const mockedJsonFiles = new Map<string, string>();

  jest
    .spyOn<typeof fs, 'readFileSync'>(fs, 'readFileSync')
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
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/hello': {
          post: {
            summary: 'mocked',
            description: '',
            operationId: 'mocked.post.hello',
            tags: undefined,
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [],
            responses: { 200: { description: '200 response' } },
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
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/hello': {
          post: {
            summary: 'mocked',
            description: 'I like documentation',
            operationId: 'mocked.post.hello',
            tags: undefined,
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [],
            responses: { 200: { description: '200 response' } },
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
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/hello': {
          post: {
            summary: 'mocked',
            description: '',
            operationId: 'mocked.post.hello',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [],
            tags: undefined,
            responses: {
              200: {
                description: 'this went well',
                schema: { $ref: '#/definitions/helloPostResponse' },
              },
              400: { description: 'failed Post' },
              502: { description: 'server error' },
            },
          },
        },
      });
    });

    it('should generate an endpoint with path parameters', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'test/{path}',
              method: 'get',
              request: {
                parameters: {
                  paths: {
                    pathParam2: false,
                  },
                },
              },
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/test/{path}': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.test/{path}',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [
              {
                name: 'pathParam2',
                type: 'string',
                in: 'path',
                required: false,
                description: undefined,
              },
              {
                name: 'path',
                type: 'string',
                description: undefined,
                in: 'path',
                required: true,
              },
            ],
            responses: { 200: { description: '200 response' } },
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
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
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
            responses: { 200: { description: '200 response' } },
          },
        },
      });
    });

    it('should generate an endpoint with query parameters using builtin params', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'goodbye',
              method: 'get',
              request: {
                parameters: {
                  querystrings: {
                    bob: true,
                    foo: false,
                  },
                },
              },
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [
              {
                name: 'bob',
                type: 'string',
                in: 'query',
                required: true,
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
            responses: { 200: { description: '200 response' } },
          },
        },
      });
    });

    it('should ignore builtin query params if custom config query params are specified', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'goodbye',
              method: 'get',
              queryStringParameters: {},
              request: { parameters: { querystrings: { bob: true } } },
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [],
            responses: { 200: { description: '200 response' } },
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
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
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

    it('should generate an endpoint with consumes parameter', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'goodbye',
              method: 'get',
              consumes: ['application/json', 'application/pdf'],
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
            consumes: ['application/json', 'application/pdf'],
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

    it('should generate an endpoint with produces parameter', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'goodbye',
              method: 'get',
              produces: ['application/json', 'application/pdf'],
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
            consumes: ['application/json'],
            produces: ['application/json', 'application/pdf'],
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

    it('should generate an endpoint with header parameters using builtin params', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'goodbye',
              method: 'get',
              request: {
                parameters: {
                  headers: {
                    bob: true,
                    foo: false,
                  },
                },
              },
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [
              {
                name: 'bob',
                type: 'string',
                description: undefined,
                in: 'header',
                required: true,
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

    it('should ignore builtin header params if custom config header params are specified', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'goodbye',
              method: 'get',
              headerParameters: {},
              request: {
                parameters: {
                  headers: { bob: true },
                },
              },
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [],
            responses: { 200: { description: '200 response' } },
          },
        },
      });
    });

    it('should generate an endpoint with multi-valued query parameters', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'goodbye',
              method: 'get',
              queryStringParameters: {
                bob: {
                  required: true,
                  type: 'array',
                  arrayItemsType: 'string',
                  description: 'bob',
                },
                count: {
                  required: false,
                  type: 'array',
                  arrayItemsType: 'integer',
                },
              },
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({
        '/goodbye': {
          get: {
            summary: 'mocked',
            description: '',
            tags: undefined,
            operationId: 'mocked.get.goodbye',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [
              {
                name: 'bob',
                type: 'array',
                items: {
                  type: 'string',
                },
                collectionFormat: 'multi',
                description: 'bob',
                in: 'query',
                required: true,
              },
              {
                name: 'count',
                type: 'array',
                items: {
                  type: 'integer',
                },
                collectionFormat: 'multi',
                in: 'query',
                required: false,
                description: undefined,
              },
            ],
            responses: { 200: { description: '200 response' } },
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
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths).toEqual({});
    });

    it('should add path without remove existing', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([{ http: { path: 'hello', method: 'post' } }]),
        options,
        logging
      );
      serverlessAutoSwagger.swagger.paths = {
        '/should': {
          get: {
            operationId: 'still be here',
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
          get: {
            operationId: 'still be here',
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
            operationId: 'mocked.post.hello',
            consumes: ['application/json'],
            produces: ['application/json'],
            parameters: [],
            responses: { 200: { description: '200 response' } },
          },
        },
      });
    });
  });

  describe('gatherSwaggerOverrides', () => {
    it('should use defaults if overrides are not specified', () => {
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
        options,
        logging
      );

      serverlessAutoSwagger.gatherSwaggerOverrides();

      expect(serverlessAutoSwagger.swagger).toEqual({
        definitions: expect.any(Object),
        info: expect.any(Object),
        paths: expect.any(Object),
        securityDefinitions: expect.any(Object),
        swagger: '2.0',
      });
    });

    it('should use overrides if specified', () => {
      const fileName = 'test.json';
      const swaggerDoc = { foo: { bar: true } };
      mockJsonFile(fileName, swaggerDoc);

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
            basePath: '/bp',
            host: 'some-host',
            title: 'My API Title',
            description: 'API Description',
            schemes: ['ws'],
            swaggerFiles: [fileName],
          }
        ),
        options,
        logging
      );

      serverlessAutoSwagger.gatherSwaggerOverrides();

      expect(serverlessAutoSwagger.swagger).toEqual({
        definitions: expect.any(Object),
        info: { title: 'My API Title', version: '1', description: 'API Description' },
        paths: expect.any(Object),
        securityDefinitions: expect.any(Object),
        swagger: '2.0',
        schemes: ['ws'],
        basePath: '/bp',
        host: 'some-host',
        ...swaggerDoc,
      });
    });
  });

  describe('gatherSwaggerFiles', () => {
    it('should add additionalProperties', async () => {
      mockJsonFile('test.json', {
        foo: {
          bar: true,
        },
      });

      const swaggerFiles = ['test.json'];
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
          { swaggerFiles }
        ),
        options,
        logging
      );

      await serverlessAutoSwagger.gatherSwaggerFiles(swaggerFiles);

      expect(serverlessAutoSwagger.swagger).toEqual({
        swagger: '2.0',
        info: { title: '', version: '1' },
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

      const swaggerFiles = ['test.json'];
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
          { swaggerFiles }
        ),
        options,
        logging
      );

      await serverlessAutoSwagger.gatherSwaggerFiles(swaggerFiles);

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

      const swaggerFiles = ['helloworld.json', 'foobar.json'];
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
          { swaggerFiles }
        ),
        options,
        logging
      );

      await serverlessAutoSwagger.gatherSwaggerFiles(swaggerFiles);

      expect(serverlessAutoSwagger.swagger).toEqual({
        swagger: '2.0',
        info: { title: '', version: '1' },
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

  describe('overrideOperationId', () => {
    it('should use defaults if overrides are not specified', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'hello',
              method: 'post',
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths['/hello'].post?.operationId).toBe('mocked.post.hello');
    });

    it('should use operationId override if specified', () => {
      const serverlessAutoSwagger = new ServerlessAutoSwagger(
        generateServerlessFromAnEndpoint([
          {
            http: {
              path: 'hello',
              method: 'post',
              operationId: 'postHello',
            },
          },
        ]),
        options,
        logging
      );
      serverlessAutoSwagger.generatePaths();

      expect(serverlessAutoSwagger.swagger.paths['/hello'].post?.operationId).toBe('postHello');
    });
  });
});
