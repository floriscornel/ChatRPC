import { Schema } from './schema';
import { Service } from './service';

export interface MethodRequestWrapper {
  service: string;
  method: string;
  input: unknown;
}

export const methodRequestWrapperSchema: Schema<MethodRequestWrapper> = {
  type: 'object',
  properties: {
    service: {
      type: 'string',
    },
    method: {
      type: 'string',
    },
    input: {
      type: 'any',
    },
  },
  required: ['service', 'method', 'input'],
};

export interface MessageWrapper {
  message: string;
}

export const messageWrapperSchema: Schema<MessageWrapper> = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
  required: ['message'],
};

export interface ChatMessage {
  content: string;
  role: 'user' | 'system' | 'assistant';
  name?: string;
}

export type ChatHandler = (
  messages: ChatMessage[],
  services: Service[],
  promptSuffix: string
) => Promise<ChatMessage[]>;
