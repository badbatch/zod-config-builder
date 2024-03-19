import { type JSONSchema7, type JSONSchema7Definition } from 'json-schema';

export const isValidPropertyDefinition = (
  propertyDefinition: JSONSchema7Definition | undefined
): propertyDefinition is JSONSchema7 => typeof propertyDefinition === 'object';
