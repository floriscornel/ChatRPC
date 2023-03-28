/**
 * {@link Method} input and output definitions are defined by this Schema type.
 * It is a recursive type that is based on the JSON Schema specification.
 * @see https://json-schema.org/understanding-json-schema/reference/index.html
 *
 * This library does not implement the full JSON Schema specification, only a subset of it.
 * At runtime objects can be validated using the {@link validate} function.
 */

export type Schema<T> = BaseSchema<T> &
  (
    | ObjectSchema<T>
    | ArraySchema<T>
    | NumberSchema
    | StringSchema
    | BooleanSchema
    | AnySchema
    | NullSchema
  );

export type BaseSchema<T> = {
  description?: string;
  type: SchemaTypeString<T>;
};

export type ObjectSchema<T> = {
  type: 'object';
  properties: {
    [K in keyof T]: Schema<T[K]>;
  };
  required?: (keyof T)[];
};

export type ArraySchema<T> = {
  type: 'array';
  items: Schema<T extends unknown[] ? T[number] : never>;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
};

export type NumberSchema = {
  type: 'number';
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
};

export type StringSchema = {
  type: 'string';
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
};

export type BooleanSchema = {
  type: 'boolean';
};

export type NullSchema = {
  type: 'null';
};

export type AnySchema = {
  type: 'any';
};

export type SchemaTypeString<T> = T extends string
  ? 'string'
  : T extends number
  ? 'number'
  : T extends boolean
  ? 'boolean'
  : T extends null
  ? 'null'
  : T extends unknown[]
  ? 'array'
  : T extends object
  ? 'object'
  : 'any';
