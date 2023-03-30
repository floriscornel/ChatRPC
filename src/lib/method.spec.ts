import test from 'ava';

import { Method } from './method';

test('isEven Method', async (t) => {
  const isEven = new Method(
    async (input: number) => input % 2 === 0,
    { type: 'number' },
    { type: 'boolean' }
  );

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
    t.is(await isEven.handler(input), output);
  }
});
