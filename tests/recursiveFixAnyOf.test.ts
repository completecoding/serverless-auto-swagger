import { recursiveFixAnyOf } from '../src/helperFunctions';
import { Definition } from '../src/swagger';

describe('test of recursiveFixAnyOf', () => {
  test('without AnyOf', () => {
    const definition: Record<string, Definition> = {
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

    expect(recursiveFixAnyOf(definition)).toMatchObject(definition);
  });

  // TODO add more tests
});
