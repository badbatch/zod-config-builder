import { type JSONSchema } from 'zod/v4/core';

export const hasRecordInvalidDefaults = (propertyDefinition: JSONSchema.JSONSchema): boolean =>
  !!propertyDefinition.additionalProperties &&
  typeof propertyDefinition.additionalProperties === 'object' &&
  'default' in propertyDefinition.additionalProperties;
