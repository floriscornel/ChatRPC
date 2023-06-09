import { Schema } from './schema';

export interface MessageWrapper {
  message: string;
}

export interface MethodRequestWrapper {
  service: string;
  method: string;
  input: unknown;
}

export type MethodResponseWrapper = { output: unknown } | { error: string };

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

export const messageWrapperSchema: Schema<MessageWrapper> = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
  required: ['message'],
};
