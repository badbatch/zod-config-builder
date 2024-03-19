import { type JSONSchema7 } from 'json-schema';

export const arrayHasInvalidDefaults = (propertyDefinition: JSONSchema7) => {
  const { items } = propertyDefinition;
  return items && typeof items === 'object' && 'default' in items;
};
