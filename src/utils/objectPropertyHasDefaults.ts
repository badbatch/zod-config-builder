import { type JSONSchema7 } from 'json-schema';

export const objectPropertyHasDefaults = (propertyDefinition: JSONSchema7) =>
  propertyDefinition.properties &&
  Object.values(propertyDefinition.properties).some(value => typeof value === 'object' && 'default' in value);
