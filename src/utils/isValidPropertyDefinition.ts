import { type JSONSchema } from 'zod/v4/core';

export const isValidPropertyDefinition = (
  propertyDefinition?: JSONSchema._JSONSchema,
): propertyDefinition is JSONSchema.JSONSchema => !!propertyDefinition && typeof propertyDefinition === 'object';
