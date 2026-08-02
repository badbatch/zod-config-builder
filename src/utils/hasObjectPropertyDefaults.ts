import { type JSONSchema } from 'zod/v4/core';

export const hasObjectPropertyDefaults = (propertyDefinition: JSONSchema.JSONSchema): boolean =>
  !!propertyDefinition.properties &&
  Object.values(propertyDefinition.properties).some(value => typeof value === 'object' && 'default' in value);
