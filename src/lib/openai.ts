import {
  ChatHandler,
  MessageWrapper,
  messageWrapperSchema,
  MethodRequestWrapper,
  methodRequestWrapperSchema,
} from './interface';
import { validate } from './validate';

/**
 * This is the prompt that will be sent to the OpenAI API.
 */
const getChatGpt3Prompt = (promptSuffix: string): string => {
  return `Pretend to be a machine that can interact with external services. All messages must be in JSON format.

Rules:
1. All messages to the User must be in the following format:
WARPPED_MESSAGE_SCHEMA: ${JSON.stringify(messageWrapperSchema)}

3. You can request the execution of a method of a service by sending the following format:
RPC_EXECUTION_SCHEMA: ${JSON.stringify(methodRequestWrapperSchema)}
Note: The user cannot see the output of the method execution. The output is only visible to the system.
You must inform the user of the output of the method execution.
To get the available services and methods, send the following message:
Assistant: ${JSON.stringify({ service: 'root', method: 'getServices' })}

A typical conversation might look like this:
User: ${JSON.stringify({
    message:
      'Hello, I would like to get information about currency conversion.',
  })}
Assistant: ${JSON.stringify({
    message:
      'I have have access to a realtime currency conversion service. What currency would you like to convert from?',
  })}
User: ${JSON.stringify({ message: 'I would like to convert 500 USD to EUR.' })}
Assistant: ${JSON.stringify({
    service: 'currency',
    method: 'convert',
    input: { amount: 500, from: 'USD', to: 'EUR' },
  })}
System: ${JSON.stringify({ output: 415.53 })}
Assistant: ${JSON.stringify({
    message: '500 USD is equivalent to 415.53 EUR.',
  })}

Today is ${new Date().toLocaleDateString()}.
${promptSuffix}`;
};

/**
 * Returns a JSON string with the format { error: string }.
 */
const getErrorMessage = (error: string): string => {
  const response = {
    error: `${error}\nYou must reply with JSON schema WARPPED_MESSAGE or RPC_EXECUTION.`,
  };
  return JSON.stringify(response);
};

/**
 * Parses the response from ChatGPT3 into either a Message to the user
 * or a structured RPC request.
 */
const parseChatGptResponse = (
  input: string
): MessageWrapper | MethodRequestWrapper => {
  const trimmedJsonInput = input.substring(
    input.indexOf('{'),
    input.lastIndexOf('}') + 1
  );
  if (trimmedJsonInput === '') {
    // If the input does not contain a JSON object, we assume it is a message.
    return {
      message: input,
    };
  }
  const r = JSON.parse(trimmedJsonInput);
  if (r.message != null && typeof r.message === 'string') {
    return {
      message: r.message,
    };
  }
  if (
    r.service != null &&
    typeof r.service === 'string' &&
    r.method != null &&
    typeof r.method === 'string'
  ) {
    return {
      service: r.service,
      method: r.method,
      input: r.input ?? null,
    } as MethodRequestWrapper;
  }
  throw new Error(
    'The input JSON object is not a valid MessageWrapper or MethodRequestWrapper.'
  );
};

/**
 * This is the handler that will be called by the ChatGPT3 service.
 * It will look at the last message and decide what to do.
 * If the last message is from the assistant, it will try to parse it.
 * If it is a valid RPC request, it will execute the method and return the output.
 * If it is a valid message, it will return the message to the user.
 * If it is not a valid RPC request or message, it will return an error message.
 */
export const chatGptServiceHandler: ChatHandler = async (
  messages,
  services,
  prompt
) => {
  // If there are no messages, we insert the prompt.
  if (messages.length === 0) {
    messages.push({
      role: 'system',
      content: getChatGpt3Prompt(prompt),
    });
    messages.push({
      role: 'assistant',
      content: JSON.stringify({ service: 'root', method: 'getServices' }),
    });
    messages.push({
      role: 'system',
      content: JSON.stringify({ output: services.map((s) => s.describe()) }),
    });
    // There is no last message, so we can't reply.
    return messages;
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role === 'assistant') {
    try {
      const r = parseChatGptResponse(lastMessage.content);
      lastMessage.content = JSON.stringify(r); // Make sure the message history contains valid JSON.
      if (Object.keys(r).includes('service')) {
        const { service, method, input } = r as MethodRequestWrapper;
        const s = services.find((s) => s.name === service);
        if (s == null) {
          // Service not found.
          messages.push({
            role: 'system',
            content: JSON.stringify({
              error: `Service with name '${service}' not found.`,
            }),
          });
          return messages;
        }
        const m = s.methods[method];
        if (m == null) {
          // Method not found.
          messages.push({
            role: 'system',
            content: JSON.stringify({
              error: `Method '${method}' not found in service '${service}'.`,
            }),
          });
          return messages;
        }
        // TODO: Fix input validation with automated tests or external library.
        // eslint-disable-next-line no-constant-condition
        if (false && !validate(input, m.inputDefinition)) {
          // Input does not match method input definition.
          messages.push({
            role: 'system',
            content: JSON.stringify({
              error:
                'Your input does not match the input definition.\n' +
                `Definition: ${JSON.stringify(m.inputDefinition)})\n` +
                `Input: ${JSON.stringify(input)}`,
            }),
          });
          return messages;
        }
        const output = await m.handler(input);
        messages.push({
          role: 'system',
          content: JSON.stringify({ output }),
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        messages.push({
          role: 'system',
          content: getErrorMessage(e.message),
        });
        return messages;
      }
      messages.push({
        role: 'system',
        content: getErrorMessage('Unknown error.'),
      });
      return messages;
    }
  }

  return messages;
};
