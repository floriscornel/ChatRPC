/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'ava';

import { Schema } from './schema';
import { validate } from './validate';

type SchemaPair<T> = [T, Schema<T>];

const validCases: SchemaPair<any>[] = [
  [true, { type: 'boolean' }],
  [false, { type: 'boolean' }],
  [1, { type: 'number' }],
  [1.1, { type: 'number' }],
  [null, { type: 'null' }],
  [null, { type: 'any' }],
  [[], { type: 'array', items: { type: 'null' } }],
  [[], { type: 'array', items: { type: 'string' }, maxItems: 0 }],
  [[], { type: 'array', items: { type: 'string' }, maxItems: 10 }],
  [[], { type: 'array', items: { type: 'string' }, minItems: 0 }],
  [['a'], { type: 'array', items: { type: 'string' }, minItems: 1 }],
  [['a'], { type: 'array', items: { type: 'string' }, maxItems: 1 }],
  [['a'], { type: 'array', items: { type: 'string' }, maxItems: 2 }],
  [['a', 'b'], { type: 'array', items: { type: 'string' }, minItems: 1 }],
  [['a', 'b'], { type: 'array', items: { type: 'string' }, minItems: 2 }],
  ['hello', { type: 'string' }],
  ['hello', { type: 'string', minLength: 5 }],
  ['hello', { type: 'string', maxLength: 5 }],
  ['hello', { type: 'string', pattern: /^hello$/ }],
  ['hello', { type: 'string', enum: ['hello'] }],
  [{}, { type: 'object', properties: {} }],
  [{}, { type: 'any' }],
  [
    { hello: 'world' },
    { type: 'object', properties: { hello: { type: 'string' } } },
  ],
  [
    { hello: { a: 1, b: true, c: ['apple', 'orange'] } },
    {
      type: 'object',
      properties: {
        hello: {
          type: 'object',
          properties: {
            a: { type: 'number', exclusiveMinimum: 0, exclusiveMaximum: 2 },
            b: { type: 'boolean' },
            c: {
              type: 'array',
              items: { type: 'string' },
              minItems: 2,
              maxItems: 2,
              uniqueItems: true,
            },
          },
          required: ['a', 'b', 'c'],
        },
      },
      required: ['hello'],
    },
  ],
];

test('validate correct examples', (t) => {
  for (const [input, schema] of validCases) {
    t.true(
      validate(input, schema),
      `Incorrectly validated ${JSON.stringify(
        input,
      )} as 'false' against ${JSON.stringify(schema)}`,
    );
  }
});

const invalidCases: SchemaPair<any>[] = [
  [true, { type: 'string' }],
  [false, { type: 'string' }],
  [null, { type: 'string' }],
  [1, { type: 'string' }],
  [1.1, { type: 'string' }],
  [5.9, { type: 'number', exclusiveMinimum: 6 }],
  [6.1, { type: 'number', exclusiveMaximum: 6 }],
  ['hello', { type: 'boolean' }],
  ['hello', { type: 'number' }],
  ['hello', { type: 'object', properties: { hello: { type: 'string' } } }],
  ['hello', { type: 'array', items: { type: 'string' } }],
  ['hello', { type: 'string', minLength: 6 }],
  ['hello', { type: 'string', maxLength: 4 }],
  ['hello', { type: 'string', pattern: /^world$/ }],
  ['hello', { type: 'string', enum: ['world'] }],
  [[], { type: 'array', items: { type: 'string' }, minItems: 1 }],
  [['a', 'b'], { type: 'array', items: { type: 'string' }, maxItems: 1 }],
  [['a', 'a'], { type: 'array', items: { type: 'string' }, uniqueItems: true }],
  [
    ['a', true],
    { type: 'array', items: { type: 'string' }, uniqueItems: true },
  ],
  [
    { hello: 'world' },
    {
      type: 'object',
      properties: {
        hello: { type: 'string' },
        world: { type: 'string' },
      },
      required: ['hello', 'world'],
    },
  ],
  [
    { hello: { world: 3 } },
    {
      type: 'object',
      properties: {
        hello: {
          type: 'object',
          properties: {
            world: { type: 'string' },
          },
        },
      },
    },
  ],
  [
    { hello: { world: 3 } },
    {
      type: 'object',
      properties: {
        hello: {
          type: 'object',
          properties: {},
        },
      },
    },
  ],
];

test('validate incorrect examples', (t) => {
  for (const [input, schema] of invalidCases) {
    t.false(
      validate(input, schema),
      `Incorrectly validated ${JSON.stringify(
        input,
      )} as 'true' against ${JSON.stringify(schema)}`,
    );
  }
});

test('validate exceptions', (t) => {
  t.throws(() =>
    validate(BigInt(1), { type: 'incorrect' } as unknown as Schema<null>),
  );
});

test('TMDB movie search request', (t) => {
  const inDef: Schema<{
    include_adult?: boolean;
    region?: string;
    year?: number;
    primary_release_year?: number;
    query: string;
    page?: number;
  }> = {
    type: 'object',
    properties: {
      query: { type: 'string' },
      page: { type: 'number' },
      include_adult: { type: 'boolean' },
      year: { type: 'number' },
      primary_release_year: { type: 'number' },
    },
    required: ['query'],
  };

  t.is(validate({ query: 'The Matrix', year: 1999 }, inDef), true);
  t.is(validate({ query: 'The Matrix', year: '1999' }, inDef), false);
});
