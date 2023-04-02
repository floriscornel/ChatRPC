import {
  MessageWrapper,
  MethodRequestWrapper,
  MethodResponseWrapper,
} from './interface';
import { Service } from './service';
import { validate } from './validate';

export type ChatMessage = {
  role: 'user' | 'system' | 'assistant';
} & (
  | {
      role: 'user' | 'assistant' | 'system';
      type: 'message';
      content: MessageWrapper;
    }
  | {
      role: 'assistant';
      type: 'request';
      content: MethodRequestWrapper;
    }
  | {
      role: 'system';
      type: 'response';
      content: MethodResponseWrapper;
    }
  | {
      role: 'system';
      type: 'prompt';
      content: string;
    }
);

/**
 * A chat is a conversation between a user and a machine.
 * The machine can interact with external services (see {@link Service}).
 *
 * @example
 * ```ts
 * const chat = new Chat();
 * chat.registerService('currency', new CurrencyService());
 * chat.addUserInput('Hello bot!');
 * chat.addAssistantOutput('{"message":"Hello human!"}');
 * ```
 */

export class Chat {
  private _prompt: string;
  private _messages: ChatMessage[] = [];
  private _services: Record<string, Service> = {};

  constructor(config?: { prompt?: string }) {
    /**
     * Returns the prompt for the chat.
     * This prompt is used to initialize the chat.
     * See {@link getChatGpt3Prompt} for an prebuilt prompt for OpenAI's GPT-3.
     */
    this._prompt = config?.prompt ?? '';
  }

  registerService<N extends string, S extends Service>(
    name: N & (N extends keyof Chat ? never : N),
    service: S
  ) {
    if (name in this) {
      throw new Error(`Service name "${name}" is reserved and cannot be used.`);
    }
    this._services = { ...this._services, [name]: service };
    return new Proxy<Chat>(this, {
      get(target, prop, receiver) {
        // for existing keys in _services, return the service
        if (typeof prop === 'string' && prop in target._services) {
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
   * Starts the conversation
   */
  private init() {
    this._messages.push({
      role: 'system',
      type: 'prompt',
      content: this._prompt,
    });
    this.addAssistantMessage({
      service: 'root',
      method: 'getServices',
      input: null,
    });
    this.addSystemMessage({ output: this.describe() });
  }

  /**
   * Adds a message from the user to the chat.
   */
  addUserInput(message: string) {
    if (this._messages.length === 0) {
      this.init();
    }

    const wrapped: MessageWrapper = { message };
    this._messages.push({ role: 'user', type: 'message', content: wrapped });
  }

  /**
   * Adds a message from the user to the chat.
   */
  addAssistantMessage(content: MessageWrapper | MethodRequestWrapper) {
    if (this._messages.length === 0) {
      this.init();
    }
    if ('message' in content) {
      this._messages.push({ role: 'assistant', type: 'message', content });
    } else {
      this._messages.push({ role: 'assistant', type: 'request', content });
    }
  }

  addSystemMessage(content: MessageWrapper | MethodResponseWrapper) {
    if ('message' in content) {
      this._messages.push({ role: 'system', type: 'message', content });
    } else {
      this._messages.push({ role: 'system', type: 'response', content });
    }
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
      return { error: (e as Error).message };
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
      typeof r.service === 'string' &&
      typeof r.method === 'string'
    ) {
      return {
        service: r.service,
        method: r.method,
        input: r.input ?? null,
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

  /**
   * Returns the prompt for the chat.
   */
  public get prompt(): string {
    return this._prompt;
  }

  /**
   * Returns the messages in the chat.
   * The messages are returned as a deep clone to prevent accidental mutation.
   * The messages are returned in the order they were added.
   * The first message is the prompt.
   */
  public get messages(): ChatMessage[] {
    return [...this._messages];
  }

  /**
   * Returns the last message in the chat.
   * The message is returned as a deep clone to prevent accidental mutation.
   */
  public get lastMessage(): ChatMessage {
    return this._messages[this._messages.length - 1];
  }

  describe(): object {
    const services: Record<string, object> = {};
    for (const [name, service] of Object.entries(this._services)) {
      services[name] = service.describe();
    }
    // Deep clone the object to prevent accidental mutation.
    return JSON.parse(JSON.stringify(services));
  }
}
