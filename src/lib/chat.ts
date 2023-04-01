import {
  MessageWrapper,
  MethodRequestWrapper,
  MethodResponseWrapper,
} from './interface';
import { Service } from './service';
import { validate } from './validate';

export interface ChatMessage {
  content: MessageWrapper | MethodRequestWrapper | MethodResponseWrapper;
  role: 'user' | 'system' | 'assistant';
  name?: string;
}

type ReservedServiceNames = 'prompt' | 'messages' | 'lastMessage';

export class Chat {
  private _prompt: string;
  private _messages: ChatMessage[] = [];
  private _services: Record<string, Service> = {};
  private _reservedNames: string[] = ['prompt', 'messages', 'lastMessage'];

  constructor(config?: { prompt?: string }) {
    this._prompt = config?.prompt ?? '';
  }

  registerService<N extends string, S extends Service>(
    name: N & (N extends ReservedServiceNames ? never : N),
    service: S
  ) {
    if (this._reservedNames.includes(name)) {
      throw new Error(`Service name "${name}" is reserved and cannot be used.`);
    }
    this._services = { ...this._services, [name]: service };
    return new Proxy<Chat>(this, {
      get(target, prop, receiver) {
        // if prop is not a string we can't do anything with it
        if (typeof prop !== 'string') {
          return undefined;
        }
        // for existing keys in _services, return the service
        if (prop in target._services) {
          return target._services[prop];
        }
        // otherwise return the value from the original object
        return Reflect.get(target, prop, receiver);
      },
    }) as typeof this & {
      [K in N]: S;
    };
  }

  /**
   * Adds a message from the user to the chat.
   */
  addUserInput(message: string) {
    const wrapped: MessageWrapper = { message };
    this._messages.push({ role: 'user', content: wrapped });
  }

  /**
   * Adds a message from the user to the chat.
   */
  addAssistantMessage(wrapper: MessageWrapper | MethodRequestWrapper) {
    this._messages.push({
      role: 'assistant',
      content: wrapper,
    });
  }

  addSystemMessage(
    message: MessageWrapper | MethodRequestWrapper | MethodResponseWrapper
  ) {
    this._messages.push({ role: 'system', content: message });
  }

  /**
   * Adds a message from the bot to the chat.
   */
  async addAssistantOutput(
    message: string
  ): Promise<MethodResponseWrapper | null> {
    try {
      const wrapped = this.parseBotMessage(message);
      this.addAssistantMessage(wrapped);

      if ('message' in wrapped) {
        return null;
      }
      // The message is a method request.
      const response = await this.getMethodResponse(wrapped);
      this.addSystemMessage(response);
      return response;
    } catch (e) {
      // We failed to parse the message.
      if (e instanceof Error) {
        return { error: e.message };
      }
      return {
        error: 'We could not parse your response. Please format it propperly.',
      };
    }
  }

  private parseBotMessage(
    input: string
  ): MessageWrapper | MethodRequestWrapper {
    // Find the first and last curly braces in the input.
    // This is a very simple way to find the JSON object in the input.
    const trimmedJsonInput = input.substring(
      input.indexOf('{'),
      input.lastIndexOf('}') + 1
    );
    if (trimmedJsonInput === '') {
      // If the input does not contain a JSON object, we assume it is a message is missing a JSON wrapper.
      return {
        message: input,
      };
    }
    // This can throw an error if the input is not a valid JSON object.
    const r = JSON.parse(trimmedJsonInput);
    if (r.message != null && typeof r.message === 'string') {
      // If the input is a MessageWrapper, return it.
      return {
        message: r.message,
      };
    }
    if (
      'service' in r &&
      'method' in r &&
      'input' in r &&
      typeof r.service === 'string' &&
      typeof r.method === 'string'
    ) {
      return {
        service: r.service,
        method: r.method,
        input: r.input,
      };
    }
    throw new Error(
      'The input JSON object is not a valid MessageWrapper or MethodRequestWrapper.'
    );
  }

  private async getMethodResponse(
    warpper: MethodRequestWrapper
  ): Promise<MethodResponseWrapper> {
    const { service, method, input } = warpper;
    const s = this._services[service];
    if (s == null) {
      // Service not found.
      return {
        error: `Service "${service}" not found.`,
      };
    }
    const m = s.getMethod(method);
    if (m == null) {
      // Method not found.
      return {
        error: `Method "${method}" not found in service "${service}".`,
      };
    }
    if (!validate(input, m.input)) {
      // Input does not match method input definition.
      return {
        error:
          'Your input does not match the input definition.\n' +
          `Definition: ${JSON.stringify(m.input)})`,
      };
    }
    return {
      output: await m.handler(input),
    };
  }

  public get prompt(): string {
    return this._prompt;
  }

  public get messages(): ChatMessage[] {
    return [...this._messages];
  }

  public get lastMessage(): ChatMessage {
    return this._messages[this._messages.length - 1];
  }
}
