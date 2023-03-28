import { Schema } from './schema';

/**
 * Validate an input against a {@link Schema}.
 * @param input The input to validate.
 * @param schema The schema to validate against. This is a recursive type.
 * @returns True if the input is valid, false otherwise.
 * @throws An error if the schema is invalid.
 * @example
 * Here's a simple example:
 * ```ts
 * const schema: Schema<number> = {
 *   type: 'number',
 * };
 * const input = 123;
 * const isValid = validate(input, schema);
 * ```
 *
 * @example
 * Here's an example with a nested object:
 * ```ts
 * const schema: Schema<{ foo: { bar: string } }> = {
 *   type: 'object',
 *   properties: {
 *     foo: {
 *       type: 'object',
 *       properties: {
 *         bar: {
 *           type: 'string',
 *         },
 *       },
 *     },
 *   },
 * };
 * const input = { foo: { bar: 'baz' } };
 * const isValid = validate(input, schema);
 * ```
 *
 */
export function validate(input: any, schema: Schema<any>): boolean {
  const { type: expectedType } = schema;
  switch (expectedType) {
    case 'object':
      return validateObject(input, schema as Schema<object>);
    case 'string':
      return validateString(input, schema);
    case 'number':
      return validateNumber(input, schema);
    case 'boolean':
      return validateBoolean(input, schema);
    case 'null':
      return validateNull(input, schema);
    case 'array':
      return validateArray(input, schema);
    default:
      throw new Error(`Unknown type: ${expectedType}`);
  }
}

function validateObject(input: any, schema: Schema<object>): boolean {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  if (schema.required) {
    for (const key of schema.required) {
      if (!(key in input)) {
        return false;
      }
    }
  }
  for (const [key, value] of Object.entries(schema.properties)) {
    if (!(key in input)) {
      return false;
    }
    if (!validate(input[key], value)) {
      return false;
    }
  }
  for (const key in input) {
    if (!(key in schema.properties)) {
      return false;
    }
  }
  return true;
}

function validateString(input: any, schema: Schema<string>): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  if (schema.minLength && input.length < schema.minLength) {
    return false;
  }
  if (schema.maxLength && input.length > schema.maxLength) {
    return false;
  }
  if (schema.pattern && !input.match(schema.pattern)) {
    return false;
  }
  if (schema.enum && !schema.enum.includes(input)) {
    return false;
  }
  return true;
}

function validateNumber(input: any, schema: Schema<number>): boolean {
  if (typeof input !== 'number') {
    return false;
  }
  if (schema.exclusiveMinimum && input <= schema.exclusiveMinimum) {
    return false;
  }
  if (schema.exclusiveMaximum && input >= schema.exclusiveMaximum) {
    return false;
  }
  return true;
}

function validateBoolean(input: any, _schema: Schema<boolean>): boolean {
  if (typeof input !== 'boolean') {
    return false;
  }
  return true;
}

function validateNull(input: any, _schema: Schema<null>): boolean {
  return input === null;
}

function validateArray(input: any, schema: Schema<any[]>): boolean {
  if (!Array.isArray(input)) {
    return false;
  }
  if (schema.minItems && input.length < schema.minItems) {
    return false;
  }
  if (schema.maxItems && input.length > schema.maxItems) {
    return false;
  }
  if (schema.uniqueItems) {
    const set = new Set();
    for (const item of input) {
      if (set.has(item)) {
        return false;
      }
      set.add(item);
    }
  }
  for (const item of input) {
    if (!validate(item, schema.items)) {
      return false;
    }
  }
  return true;
}
