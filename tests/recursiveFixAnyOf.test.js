"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helperFunctions_1 = require("../src/helperFunctions");
describe('test of recursiveFixAnyOf', () => {
    test('without AnyOf', () => {
        const definition = {
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
        console.log(helperFunctions_1.recursiveFixAnyOf);
        const result = helperFunctions_1.recursiveFixAnyOf(definition);
        expect(result).toMatchObject(definition);
    });
    //TODO add more tests
});
