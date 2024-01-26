import { type JSONSchema7 } from 'json-schema';
import { arrayHasInvalidDefaults } from './arrayHasInvalidDefaults.ts';
import { collateObjectPropertyDefaults } from './collateObjectPropertyDefaults.ts';
import { RESERVED_KEYWORDS, isPropertyReservedWord } from './isPropertyReservedWord.ts';
import { isValidPropertyDefinition } from './isValidPropertyDefinition.ts';
import { recordHasInvalidDefaults } from './recordHasInvalidDefaults.ts';

export const collateDefaultValues = <Config>(jsonSchema: JSONSchema7) => {
  const defaultValues = {} as Partial<Config>;

  for (const propertyName in jsonSchema.properties) {
    if (isPropertyReservedWord(propertyName)) {
      throw new Error(
        `"${propertyName}" is a reserved keyword within the config builder. Please use a different property name. The full list of reserved keywords is: ${[
          ...RESERVED_KEYWORDS,
        ].join(', ')}`
      );
    }

    const castPropertyName = propertyName as keyof Config;
    const propertyDefinition = jsonSchema.properties[propertyName];

    if (isValidPropertyDefinition(propertyDefinition)) {
      if (propertyDefinition.default) {
        defaultValues[castPropertyName] = propertyDefinition.default as Config[keyof Config];
      }

      if (propertyDefinition.type === 'array' && arrayHasInvalidDefaults(propertyDefinition)) {
        throw new Error(
          `When setting schema array defaults for the array assigned to "${String(
            castPropertyName
          )}", set them on the array and not the item.`
        );
      }

      if (propertyDefinition.type === 'object') {
        if (recordHasInvalidDefaults(propertyDefinition)) {
          throw new Error(
            `When setting schema property defaults for the value of the record assigned to "${String(
              castPropertyName
            )}", set them on the record and not the value.`
          );
        }

        const propertyDefaults = collateObjectPropertyDefaults(propertyDefinition);

        if (propertyDefaults) {
          defaultValues[castPropertyName] = propertyDefaults as Config[keyof Config];
        }
      }
    }
  }

  return defaultValues;
};
