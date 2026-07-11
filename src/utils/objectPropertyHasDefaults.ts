import { type JSONSchema } from 'zod/v4/core';

export const objectPropertyHasDefaults = (propertyDefinition: JSONSchema.JSONSchema): boolean =>
  !!propertyDefinition.properties &&
  Object.values(propertyDefinition.properties).some(value => typeof value === 'object' && 'default' in value);
