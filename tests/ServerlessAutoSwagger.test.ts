import ServerlessAutoSwagger from '../src/ServerlessAutoSwagger';
import {
    FullHttpEvent,
    Serverless,
} from '../src/serverlessPlugin';

const generateServerlessFromAnEndpoint = (events: FullHttpEvent[]): Serverless => (
    {
        cli: {
            log: () => {}
        },
        service: {
            service: '',
            provider: {
                name: '',
                runtime: '',
                stage: '',
                region: '',
                profile: '',
                environment: {  }
            },
            plugins: [],
            functions: {
                mocked: {
                    handler: 'mocked.handler',
                    events
                }
            },
            custom: {},
        }
    }
)

describe('ServerlessAutoSwagger', () => {
    describe('generatePaths', () => {
        it('should generate minimal endpoint', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(generateServerlessFromAnEndpoint([{
                http: {
                    path: 'hello',
                    method: 'post',
                }
            }]), {});
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                "/hello": {
                    post: {
                        summary: "mocked",
                        description: "",
                        operationId: "mocked",
                        consumes: [
                            "application/json"
                        ],
                        produces: [
                            "application/json"
                        ],
                        parameters: [],
                        responses: {
                            200: {
                                description: "200 response"
                            }
                        },
                    }
                }
            });
        });

        it('should generate an endpoint with a description', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(generateServerlessFromAnEndpoint([{
                http: {
                    path: 'hello',
                    method: 'post',
                    description: 'I like documentation'
                }
            }]), {});
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                "/hello": {
                    post: {
                        summary: "mocked",
                        description: "I like documentation",
                        operationId: "mocked",
                        consumes: [
                            "application/json"
                        ],
                        produces: [
                            "application/json"
                        ],
                        parameters: [],
                        responses: {
                            200: {
                                description: "200 response"
                            }
                        },
                    }
                }
            });
        });

        it('should generate an endpoint with a response', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(generateServerlessFromAnEndpoint([{
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
                    }
                }
            }]), {});
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                "/hello": {
                    post: {
                        summary: "mocked",
                        description: "",
                        operationId: "mocked",
                        consumes: [
                            "application/json"
                        ],
                        produces: [
                            "application/json"
                        ],
                        parameters: [],
                        responses: {
                            200: {
                                description: "this went well",
                                schema: {
                                    "$ref": "#/definitions/helloPostResponse"
                                }
                            },
                            400: {
                                description: "failed Post"
                            },
                            502: {
                                description: "server error"
                            }
                        }
                    }
                }
            });
        });

        it('should generate an endpoint with parameters', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(generateServerlessFromAnEndpoint([{
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
                    },
                }
            }]), {});
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({
                "/goodbye": {
                    get: {
                        summary: "mocked",
                        description: "",
                        operationId: "mocked",
                        consumes: [
                            "application/json"
                        ],
                        produces: [
                            "application/json"
                        ],
                        parameters: [
                            {
                                name: 'bob',
                                type: 'string',
                                description: 'bob',
                                in: "query"
                            },
                            {
                                name: 'count',
                                type: 'integer',
                                in: "query"
                            }
                        ],
                        responses: {
                            200: {
                                description: "200 response"
                            }
                        },
                    }
                }
            });
        });

        it('should filter an endpoint with exclude', () => {
            const serverlessAutoSwagger = new ServerlessAutoSwagger(generateServerlessFromAnEndpoint([{
                http: {
                    path: 'hello',
                    method: 'post',
                    exclude: true
                }
            }]), {});
            serverlessAutoSwagger.generatePaths();

            expect(serverlessAutoSwagger.swagger.paths).toEqual({});
        });
    });
});
