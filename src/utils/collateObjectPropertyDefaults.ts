import type { JSONSchema7 } from 'json-schema';
import { isBoolean, isUndefined } from 'lodash-es';
import type { Jsonifiable } from 'type-fest';
import { objectPropertyHasDefaults } from './objectPropertyHasDefaults.ts';

export const collateObjectPropertyDefaults = (propertyDefinition: JSONSchema7) => {
  const { properties } = propertyDefinition;

  if (!properties || !objectPropertyHasDefaults(propertyDefinition)) {
    return;
  }

  return Object.keys(properties).reduce<Record<string, Jsonifiable>>((acc, key) => {
    const propertyDef = properties[key];

    if (!propertyDef || isBoolean(propertyDef)) {
      return acc;
    }

    if ('default' in propertyDef && !isUndefined(propertyDef.default)) {
      acc[key] = propertyDef.default;
    }

    return acc;
  }, {});
};
