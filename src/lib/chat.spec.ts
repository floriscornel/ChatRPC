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

test('Check Empty Chat', async (t) => {
  const chat = new Chat();
  t.is(chat.messages.length, 0);
  t.assert(chat.lastMessage === undefined);
  t.is(chat.prompt, '');
  t.deepEqual(chat.describe(), {});
  t.is(await chat.addAssistantOutput(''), null);
  t.throws(() =>
    chat.registerService(
      'registerService' as string,
      new Service({ name: 'foo' })
    )
  );
  t.is(chat.addSystemMessage({ message: 'Message From System' }), undefined);
  t.is(
    chat.addAssistantMessage({ message: 'Message From Assistant' }),
    undefined
  );
  t.is(chat.addUserInput('Message From User'), undefined);
  t.deepEqual(await chat.addAssistantOutput(' {{'), {
    error: 'Unexpected end of JSON input',
  });
  t.deepEqual(await chat.addAssistantOutput('{}'), {
    error:
      'The input JSON object is not a valid MessageWrapper or MethodRequestWrapper.',
  });
  t.deepEqual(await chat.addAssistantOutput('{"service":"aaa"}'), {
    error:
      'The input JSON object is not a valid MessageWrapper or MethodRequestWrapper.',
  });
  t.deepEqual(
    await chat.addAssistantOutput('{"service":"aaa","method":"bbb"}'),
    {
      error: 'Service "aaa" not found.',
    }
  );
  const chat2 = chat.registerService('aaa', new Service({ name: 'aaa' }));
  t.deepEqual(
    await chat2.addAssistantOutput('{"service":"aaa","method":"bbb"}'),
    {
      error: 'Method "bbb" not found in service "aaa".',
    }
  );
  chat2.aaa.registerMethod(
    'bbb',
    new Method({
      handler: async (caps: boolean) => (caps ? 'BBB' : 'bbb'),
      input: { type: 'boolean' },
    })
  );
  t.deepEqual(
    await chat.addAssistantOutput('{"service":"aaa","method":"bbb"}'),
    {
      error:
        'Your input does not match the input definition.\nDefinition: {"type":"boolean"})',
    }
  );
  t.deepEqual(
    await chat.addAssistantOutput(
      '{"service":"aaa","method":"bbb", "input": 1}'
    ),
    {
      error:
        'Your input does not match the input definition.\nDefinition: {"type":"boolean"})',
    }
  );
  t.deepEqual(
    await chat.addAssistantOutput(
      '{"service":"aaa","method":"bbb", "input": true}'
    ),
    {
      output: 'BBB',
    }
  );
  t.deepEqual(
    await chat.addAssistantOutput(
      '{"service":"aaa","method":"bbb", "input": false}'
    ),
    {
      output: 'bbb',
    }
  );
});
