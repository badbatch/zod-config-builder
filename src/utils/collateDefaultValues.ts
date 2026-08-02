import { type JSONSchema } from 'zod/v4/core';
import { collateObjectPropertyDefaults } from './collateObjectPropertyDefaults.ts';
import { hasArrayInvalidDefaults } from './hasArrayInvalidDefaults.ts';
import { hasRecordInvalidDefaults } from './hasRecordInvalidDefaults.ts';
import { RESERVED_KEYWORDS, isPropertyReservedWord } from './isPropertyReservedWord.ts';
import { isValidPropertyDefinition } from './isValidPropertyDefinition.ts';

export const collateDefaultValues = <Config>(jsonSchema: JSONSchema.JSONSchema): Partial<Config> => {
  const defaultValues: Partial<Config> = {};

  for (const propertyName in jsonSchema.properties) {
    if (isPropertyReservedWord(propertyName)) {
      throw new Error(
        `"${propertyName}" is a reserved keyword within the config builder. Please use a different property name. The full list of reserved keywords is: ${[
          ...RESERVED_KEYWORDS,
        ].join(', ')}`,
      );
    }

    // TypeScript not inferring property is key of Config.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const castPropertyName = propertyName as keyof Config;
    const propertyDefinition = jsonSchema.properties[propertyName];

    if (isValidPropertyDefinition(propertyDefinition)) {
      if (propertyDefinition.default) {
        // TypeScript not inferring propertyDefinition.default is Config value.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        defaultValues[castPropertyName] = propertyDefinition.default as Config[keyof Config];
      }

      if (propertyDefinition.type === 'array' && hasArrayInvalidDefaults(propertyDefinition)) {
        throw new Error(
          // ESLint unable to derive value can also be symbol or number
          // eslint-disable-next-line unicorn/no-useless-coercion
          `When setting schema array defaults for the array assigned to "${String(castPropertyName)}", set them on the array and not the item.`,
        );
      }

      if (propertyDefinition.type === 'object') {
        if (hasRecordInvalidDefaults(propertyDefinition)) {
          throw new Error(
            // ESLint unable to derive value can also be symbol or number
            // eslint-disable-next-line unicorn/no-useless-coercion
            `When setting schema property defaults for the value of the record assigned to "${String(castPropertyName)}", set them on the record and not the value.`,
          );
        }

        const propertyDefaults = collateObjectPropertyDefaults(propertyDefinition);

        if (propertyDefaults) {
          // TypeScript not inferring propertyDefaults is Config value.
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          defaultValues[castPropertyName] = propertyDefaults as Config[keyof Config];
        }
      }
    }
  }

  return defaultValues;
};
