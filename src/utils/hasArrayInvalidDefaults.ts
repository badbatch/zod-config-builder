import { type JSONSchema } from 'zod/v4/core';

export const hasArrayInvalidDefaults = (propertyDefinition: JSONSchema.JSONSchema): boolean => {
  const { items } = propertyDefinition;
  return !!items && typeof items === 'object' && 'default' in items;
};
