import test from 'ava';

import { Schema } from './schema';
import { validate } from './validate';

const TestObject = {
  id: 1234,
  name: 'John Doe',
  isMember: true,
  ids: [1, 2, 3],
  nested: {
    id: 1234,
    array: [1, 2, 3],
    empty: null,
  },
};

const TestSchema: Schema<typeof TestObject> = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    name: {
      type: 'string',
    },
    isMember: {
      type: 'boolean',
    },
    ids: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    nested: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
        },
        array: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        empty: {
          type: 'null',
        },
      },
    },
  },
};

test('validate', (t) => {
  const result = validate(TestObject, TestSchema);
  t.is(result, true);
});
