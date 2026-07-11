import { type JSONSchema } from 'zod/v4/core';

export const isSchemaValid = (schema: JSONSchema.JSONSchema): boolean => schema.type !== 'object';
