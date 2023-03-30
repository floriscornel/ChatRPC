import test from 'ava';

import { Method } from './method';
import { Service } from './service';

test('Calculator Service', async (t) => {
  type Pair = { lhs: number; rhs: number };
  const calculatorService = new Service('calculator')
    .registerMethod(
      'add',
      new Method<Pair, number>(
        async ({ lhs, rhs }) => lhs + rhs,
        {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        { type: 'number' }
      )
    )
    .registerMethod(
      'subtract',
      new Method<Pair, number>(
        async ({ lhs, rhs }) => lhs - rhs,
        {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        { type: 'number' }
      )
    )
    .registerMethod(
      'multiply',
      new Method<Pair, number>(
        async ({ lhs, rhs }) => lhs * rhs,
        {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        { type: 'number' }
      )
    )
    .registerMethod(
      'divide',
      new Method<Pair, number>(
        async ({ lhs, rhs }) => lhs / rhs,
        {
          type: 'object',
          properties: { lhs: { type: 'number' }, rhs: { type: 'number' } },
        },
        { type: 'number' }
      )
    );

  t.is(
    JSON.stringify(calculatorService.describe()),
    '{"name":"calculator","methods":{"add":{"inputDefinition":{"type":"object","properties":{"lhs":{"type":"number"},"rhs":{"type":"number"}}},"outputDefinition":{"type":"number"}},"subtract":{"inputDefinition":{"type":"object","properties":{"lhs":{"type":"number"},"rhs":{"type":"number"}}},"outputDefinition":{"type":"number"}},"multiply":{"inputDefinition":{"type":"object","properties":{"lhs":{"type":"number"},"rhs":{"type":"number"}}},"outputDefinition":{"type":"number"}},"divide":{"inputDefinition":{"type":"object","properties":{"lhs":{"type":"number"},"rhs":{"type":"number"}}},"outputDefinition":{"type":"number"}}}}'
  );

  const data = [
    ['add', { lhs: 1, rhs: 2 }, 3],
    ['subtract', { lhs: 1, rhs: 2 }, -1],
    ['multiply', { lhs: 1, rhs: 2 }, 2],
    ['divide', { lhs: 1, rhs: 2 }, 0.5],
  ] as const;

  for (const [methodName, input, output] of data) {
    t.is(await calculatorService.methods[methodName].handler(input), output);
  }
});
