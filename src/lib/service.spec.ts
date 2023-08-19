import test from 'ava';

import { Method } from './method';
import { Service } from './service';

test('Calculator Service', async (t) => {
  type Pair = { lhs: number; rhs: number };
  const calculatorService = new Service({ name: 'calculator' })
    .registerMethod(
      'add',
      new Method<Pair, number>({
        handler: async ({ lhs, rhs }) => lhs + rhs,
        input: {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        output: { type: 'number' },
      }),
    )
    .registerMethod(
      'subtract',
      new Method<Pair, number>({
        handler: async ({ lhs, rhs }) => lhs - rhs,
        input: {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        output: { type: 'number' },
      }),
    )
    .registerMethod(
      'multiply',
      new Method<Pair, number>({
        handler: async ({ lhs, rhs }) => lhs * rhs,
        input: {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        output: { type: 'number' },
      }),
    )
    .registerMethod(
      'divide',
      new Method<Pair, number>({
        handler: async ({ lhs, rhs }) => lhs / rhs,
        input: {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        output: { type: 'number' },
      }),
    );

  t.is(calculatorService.name, 'calculator');

  const data = [
    ['add', { lhs: 1, rhs: 2 }, 3],
    ['subtract', { lhs: 1, rhs: 2 }, -1],
    ['multiply', { lhs: 1, rhs: 2 }, 2],
    ['divide', { lhs: 1, rhs: 2 }, 0.5],
  ] as const;

  for (const [methodName, input, output] of data) {
    t.is(await calculatorService[methodName].handler(input), output);
  }
});

test('Reserved Names cannot be used in registerMethod', async (t) => {
  const method = new Method({
    handler: async (input) => input,
    input: { type: 'any' },
  });

  const service = new Service({ name: 'service' });

  try {
    service.registerMethod('getMethod' as never, method);
  } catch (e) {
    if (e instanceof Error)
      t.is(
        e.message,
        'Method name "getMethod" is reserved and cannot be used.',
      );
  }
});
