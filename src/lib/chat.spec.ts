import test from 'ava';

import { Chat } from './chat';
import { Method } from './method';
import { Service } from './service';

test('Can create chat with service and method', async (t) => {
  const isEven = new Method({
    handler: async (input: number) => input % 2 === 0,
    input: { type: 'number' },
    output: { type: 'boolean' },
  });

  const service = new Service({ name: 'isEvenService' }).registerMethod(
    'isEven',
    isEven
  );

  const prompt = `Pretend that you are a chatbot.`;

  const chat = new Chat({ prompt }).registerService('isEvenService', service);

  t.is(await chat.isEvenService.isEven.handler(2), true);

  chat.addUserInput('Hello bot!');
  chat.addAssistantOutput(JSON.stringify({ message: 'Hello human!' }));
  chat.addUserInput('is 857327 even?');
  const response = await chat.addAssistantOutput(
    JSON.stringify({
      service: 'isEvenService',
      method: 'isEven',
      input: 857327,
    })
  );

  t.deepEqual(response, { output: false });

  t.deepEqual(chat.messages, [
    {
      content: prompt,
      role: 'system',
      type: 'prompt',
    },
    {
      role: 'assistant',
      type: 'request',
      content: {
        service: 'root',
        method: 'getServices',
        input: null,
      },
    },
    {
      role: 'system',
      type: 'response',
      content: {
        output: {
          isEvenService: {
            methods: {
              isEven: {
                input: {
                  type: 'number',
                },
                output: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
    { role: 'user', type: 'message', content: { message: 'Hello bot!' } },
    {
      role: 'assistant',
      type: 'message',
      content: { message: 'Hello human!' },
    },
    { role: 'user', type: 'message', content: { message: 'is 857327 even?' } },
    {
      role: 'assistant',
      type: 'request',
      content: {
        service: 'isEvenService',
        method: 'isEven',
        input: 857327,
      },
    },
    { role: 'system', type: 'response', content: { output: false } },
  ]);
});
