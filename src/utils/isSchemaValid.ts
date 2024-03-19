import { type JSONSchema7 } from 'json-schema';

export const isSchemaValid = (schema: JSONSchema7) => schema.type !== 'object';
