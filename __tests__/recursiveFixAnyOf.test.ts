import { recursiveFixAnyOf } from '../src/index';

describe('test of recursiveFixAnyOf', () => {
    test('without AnyOf', () => {
        const definition: { [key: string]: Definition } = {
            helloPostBody: {
                properties: {
                    hello: {
                        properties: {
                            there: {
                                properties: {
                                    everyone: {
                                        type: 'string',
                                    },
                                },
                                required: ['everyone'],
                                additionalProperties: false,
                                type: 'object',
                            },
                        },
                        required: ['there'],
                        additionalProperties: false,
                        type: 'object',
                    },
                    date: {
                        type: 'number',
                    },
                    number: {
                        type: 'number',
                    },
                    people: {
                        items: {
                            $ref: '#/components/schema/People',
                        },
                        type: 'array',
                    },
                },
                required: ['hello', 'date', 'number', 'people'],
                additionalProperties: false,
                type: 'object',
            },
        };

        const result = recursiveFixAnyOf(definition);

        expect(result).toMatchObject(definition);
    });
});
