import { type JSONSchema7 } from 'json-schema';
import { type ZodError, type z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { cloneNonEnumerableValues } from './transformers/cloneNonEnumerableValues.ts';
import { NonEmumeralProperties } from './types.ts';
import { arrayHasInvalidDefaults } from './utils/arrayHasInvalidDefaults.ts';
import { isDerivedValueCallback } from './utils/isDerivedValueCallback.ts';
import { isInvalidPropertyOverride } from './utils/isInvalidPropertyOverride.ts';
import { RESERVED_KEYWORDS, isPropertyReservedWord } from './utils/isPropertyReservedWord.ts';
import { isSchemaValid } from './utils/isSchemaValid.ts';
import { isValidPropertyDefinition } from './utils/isValidPropertyDefinition.ts';
import { isValidValue } from './utils/isValidValue.ts';
import { objectHasInvalidDefaults } from './utils/objectHasInvalidDefaults.ts';
import { recordHasInvalidDefaults } from './utils/recordHasInvalidDefaults.ts';
import { transformConfigSync } from './utils/transformConfig.ts';

export type ConfigBuilder<ZodTypes> = {
  [Key in keyof Required<ZodTypes>]: (
    value: ZodTypes[Key] | ((c: ZodTypes) => ZodTypes[Key]),
    override?: boolean
  ) => ConfigBuilder<ZodTypes>;
} & {
  disable: () => ConfigBuilder<ZodTypes>;
  errors: () => ZodError['errors'];
  experiment: (key: string) => ConfigBuilder<ZodTypes>;
  extend: (configBuilder: ConfigBuilder<ZodTypes>) => ConfigBuilder<ZodTypes>;
  flush: () => ZodTypes;
  fork: () => ConfigBuilder<ZodTypes>;
  toJson: () => string;
  validate: () => boolean;
  values: () => ZodTypes;
};

export const createConfigBuilder = <ZodTypes>(
  zodSchema: z.ZodSchema,
  derivedValueCallbacks: Partial<
    Record<
      keyof ZodTypes,
      (c: {
        [Key in keyof ZodTypes]: ZodTypes[Key];
      }) => ZodTypes[keyof ZodTypes]
    >
  > = {},
  initialValues: Partial<{
    [Key in keyof ZodTypes]: ZodTypes[Key];
  }> = {}
): ConfigBuilder<ZodTypes> => {
  type Config = {
    [Key in keyof ZodTypes]: ZodTypes[Key];
  };

  type DerivedValueCallback<K extends keyof Config = keyof Config> = (c: Config) => Config[K];
  let config = initialValues as Config;

  Object.defineProperty(config, NonEmumeralProperties.ZCB, {
    configurable: false,
    enumerable: false,
    value: true,
  });

  let callbacks: Partial<Record<keyof Config, DerivedValueCallback>> = { ...derivedValueCallbacks };

  const configBuilder = {
    disable: () => {
      Object.defineProperty(config, NonEmumeralProperties.DISABLED, {
        configurable: false,
        enumerable: false,
        value: true,
      });

      return configBuilder;
    },
    errors: () => {
      try {
        zodSchema.parse(configBuilder.values());
        return [];
      } catch (error: unknown) {
        return (error as ZodError).errors;
      }
    },
    experiment: (key: string) => {
      Object.defineProperty(config, NonEmumeralProperties.EXPERIMENT, {
        configurable: false,
        enumerable: false,
        value: key,
      });

      return configBuilder;
    },
    extend: (builder: ConfigBuilder<Config>) => {
      config = transformConfigSync<Config>(builder.values(), [cloneNonEnumerableValues]);
      // @ts-expect-error private property
      callbacks = { ...builder.__callbacks } as Partial<Record<keyof Config, DerivedValueCallback>>;
    },
    flush: () => {
      const values = configBuilder.values();
      config = {} as Config;

      Object.defineProperty(config, NonEmumeralProperties.ZCB, {
        configurable: false,
        enumerable: false,
        value: true,
      });

      return values;
    },
    fork: () => createConfigBuilder<Config>(zodSchema, derivedValueCallbacks),
    toJson: () => JSON.stringify(configBuilder.values(), undefined, 2),
    validate: () => {
      try {
        zodSchema.parse(configBuilder.values());
        return true;
      } catch (error: unknown) {
        console.error(error);
        return false;
      }
    },
    values: () => {
      for (const property in callbacks) {
        const callback = callbacks[property];

        if (callback) {
          config[property as keyof Config] = callback(config);
        }
      }

      return config;
    },
  } as unknown as ConfigBuilder<ZodTypes>;

  Object.defineProperty(configBuilder, NonEmumeralProperties.CALLBACKS, {
    configurable: false,
    enumerable: false,
    value: callbacks,
  });

  const jsonSchema = zodToJsonSchema(zodSchema) as JSONSchema7;

  if (isSchemaValid(jsonSchema)) {
    throw new Error(`The root type of a config schema must be "object", but received "${String(jsonSchema.type)}"`);
  }

  for (const propertyName in jsonSchema.properties) {
    if (isPropertyReservedWord(propertyName)) {
      throw new Error(
        `"${propertyName}" is a reserved keyword within the config builder. Please use a different property name. The full list of reserved keywords is: ${[
          ...RESERVED_KEYWORDS,
        ].join(', ')}`
      );
    }

    const castProperty = propertyName as keyof Config;
    const propertyDefinition = jsonSchema.properties[propertyName];

    if (isValidPropertyDefinition(propertyDefinition)) {
      if (propertyDefinition.default) {
        config[castProperty] = propertyDefinition.default as Config[keyof Config];
      }

      if (propertyDefinition.type === 'array' && arrayHasInvalidDefaults(propertyDefinition)) {
        throw new Error(
          `When setting schema array defaults for the array assigned to "${String(
            castProperty
          )}", set them on the array and not the item.`
        );
      }

      if (propertyDefinition.type === 'object') {
        if (objectHasInvalidDefaults(propertyDefinition)) {
          throw new Error(
            `When setting schema property defaults for the object assigned to "${String(
              castProperty
            )}", set them on the object and not the property.`
          );
        }

        if (recordHasInvalidDefaults(propertyDefinition)) {
          throw new Error(
            `When setting schema property defaults for the object assigned to "${String(
              castProperty
            )}", set them on the object and not the property.`
          );
        }
      }
    }

    configBuilder[castProperty] = ((value: Config[keyof Config] | DerivedValueCallback, override?: boolean) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (isInvalidPropertyOverride(config[castProperty], override)) {
        throw new Error(
          `A value already exists for "${String(
            castProperty
          )}". You may be trying to add a new values before flushing the old one. If you intended to override the existing value, pass in true as the second argument.`
        );
      }

      let propertyValue: Config[keyof Config];
      const MAX_DEPTH = 1;

      if (!isValidValue(value)) {
        throw new Error(
          `"${String(
            castProperty
          )}" value has a depth greater than ${MAX_DEPTH}. To pass in objects with a depth greater than ${MAX_DEPTH}, create a builder for that config slice.`
        );
      }

      if (isDerivedValueCallback<DerivedValueCallback>(value)) {
        callbacks[castProperty] = value;
        propertyValue = value(config);
      } else {
        propertyValue = value;
      }

      config[castProperty] = propertyValue;
      return configBuilder;
    }) as ConfigBuilder<Config>[keyof Config];
  }

  return configBuilder;
};
