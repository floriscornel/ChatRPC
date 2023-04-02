import test from 'ava';

import { Method } from './method';

test('isEven Method', async (t) => {
  const isEven = new Method({
    handler: async (input: number) => input % 2 === 0,
    input: { type: 'number' },
    output: { type: 'boolean' },
  });

  t.is(typeof isEven.handler, 'function');
  t.is(isEven.describe().input.type, 'number');
  t.is(isEven.describe().output.type, 'boolean');
  t.deepEqual(isEven.input, { type: 'number' });
  t.deepEqual(isEven.output, { type: 'boolean' });

  const data = [
    { input: 0, output: true },
    { input: 1, output: false },
    { input: 2, output: true },
    { input: 3, output: false },
    { input: 4, output: true },
    { input: 5, output: false },
    { input: 6, output: true },
  ];

  for (const { input, output } of data) {
    t.deepEqual(await isEven.handler(input), output);
  }
});
