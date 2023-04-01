import test from 'ava';

import { Chat } from './chat';
import { Method } from './method';
import { Service } from './service';

test('isEven Method', async (t) => {
  const isEven = new Method({
    handler: async (input: number) => input % 2 === 0,
    input: { type: 'number' },
    output: { type: 'boolean' },
  });

  const service = new Service({ name: 'isEvenService' }).registerMethod(
    'isEven',
    isEven
  );

  const chat = new Chat().registerService('isEven', service);

  t.is(await chat.isEven.isEven.handler(2), true);
  t.true(chat.lastMessage === undefined);
  t.deepEqual(chat.messages, []);

  chat.addUserInput('Hello bot!');
  chat.addAssistantOutput(JSON.stringify({ message: 'Hello human!' }));
  chat.addUserInput('is 857327 even?');
  const response = await chat.addAssistantOutput(
    JSON.stringify({
      service: 'isEven',
      method: 'isEven',
      input: 857327,
    })
  );

  t.deepEqual(response, { output: false });

  t.deepEqual(chat.messages, [
    { role: 'user', content: { message: 'Hello bot!' } },
    { role: 'assistant', content: { message: 'Hello human!' } },
    { role: 'user', content: { message: 'is 857327 even?' } },
    {
      role: 'assistant',
      content: {
        service: 'isEven',
        method: 'isEven',
        input: 857327,
      },
    },
    { role: 'system', content: { output: false } },
  ]);
});
