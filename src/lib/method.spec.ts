import test from 'ava';

import { Method } from './method';
import { Schema } from './schema';

type Input = {
  products: string[];
};

const inputDefinition: Schema<Input> = {
  type: 'object',
  properties: {
    products: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

type Output = {
  orderId: string;
  products: string[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
};

const outputDefinition: Schema<Output> = {
  type: 'object',
  properties: {
    orderId: {
      type: 'string',
    },
    products: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    status: {
      type: 'string',
      enum: ['pending', 'processing', 'shipped', 'delivered'],
    },
  },
};

const testMethod: Method<Input, Output> = {
  inputDefinition,
  outputDefinition,
  handler: async (input: Input): Promise<Output> => {
    return {
      orderId: '1234',
      products: input.products,
      status: 'pending',
    };
  },
};

test('check types', async (t) => {
  const res = await testMethod.handler({ products: ['123', '123'] });
  const expected = {
    orderId: '1234',
    products: ['123', '123'],
    status: 'pending',
  };
  t.deepEqual(res, expected);
});
