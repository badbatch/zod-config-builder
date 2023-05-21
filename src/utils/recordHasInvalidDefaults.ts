import type { JSONSchema7 } from 'json-schema';

export const recordHasInvalidDefaults = (propertyDefinition: JSONSchema7) =>
  propertyDefinition.additionalProperties &&
  typeof propertyDefinition.additionalProperties === 'object' &&
  'default' in propertyDefinition.additionalProperties;
