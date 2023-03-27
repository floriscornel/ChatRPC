import test from 'ava';

import { Schema } from './schema';

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

test('check types', (t) => {
  t.is(typeof TestObject, TestSchema.type);
});
