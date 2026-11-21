import { isBoolean, isDefined } from 'remeda';
import { type JSONSchema } from 'zod/v4/core';
import { hasObjectPropertyDefaults } from './hasObjectPropertyDefaults.ts';

export const collateObjectPropertyDefaults = (
  propertyDefinition: JSONSchema.JSONSchema,
): Record<string, unknown> | undefined => {
  const { properties } = propertyDefinition;

  if (!properties || !hasObjectPropertyDefaults(propertyDefinition)) {
    return;
  }

  return Object.keys(properties).reduce<Record<string, unknown>>((acc, key) => {
    const propertyDef = properties[key];

    if (!propertyDef || isBoolean(propertyDef)) {
      return acc;
    }

    if ('default' in propertyDef && isDefined(propertyDef.default)) {
      acc[key] = propertyDef.default;
    }

    return acc;
  }, {});
};
