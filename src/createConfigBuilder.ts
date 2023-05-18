import { type JSONSchema7 } from 'json-schema';
import { type ZodError, type z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { isValidValue } from './utils/isValidValue.ts';

const RESERVED_KEYWORDS = new Set(['errors', 'flush', 'fork', 'toJson', 'validate', 'values']);

export const createConfigBuilder = <ZodTypes>(
  zodSchema: z.ZodSchema,
  derivedValueCallbacks: Partial<
    Record<
      keyof ZodTypes,
      (c: {
        [Key in keyof ZodTypes]: ZodTypes[Key];
      }) => ZodTypes[keyof ZodTypes]
    >
  > = {}
) => {
  type Config = {
    [Key in keyof ZodTypes]: ZodTypes[Key];
  };

  type RequiredZodTypes = Required<ZodTypes>;
  type DerivedValueCallback = (c: Config) => ZodTypes[keyof ZodTypes];

  type ConfigBuilder = {
    [Key in keyof RequiredZodTypes]: (v: ZodTypes[Key] | ((c: Config) => ZodTypes[Key])) => ConfigBuilder;
  } & {
    errors: () => ZodError['errors'];
    flush: () => ZodTypes;
    fork: () => ConfigBuilder;
    toJson: () => string;
    toggle: (key: string) => ConfigBuilder;
    validate: () => boolean;
    values: () => ZodTypes;
  };

  let config = {} as Config;

  Object.defineProperty(config, '__zcb', {
    configurable: false,
    enumerable: false,
    value: true,
  });

  const callbacks: Partial<Record<keyof ZodTypes, DerivedValueCallback>> = { ...derivedValueCallbacks };

  const configBuilder = {
    errors: () => {
      try {
        zodSchema.parse(configBuilder.values());
        return [];
      } catch (error: unknown) {
        return (error as ZodError).errors;
      }
    },
    flush: () => {
      const values = configBuilder.values();
      config = {} as Config;

      Object.defineProperty(config, '__zcb', {
        configurable: false,
        enumerable: false,
        value: true,
      });

      return values;
    },
    fork: () => createConfigBuilder<ZodTypes>(zodSchema, derivedValueCallbacks),
    toJson: () => JSON.stringify(configBuilder.values()),
    toggle: (key: string) => {
      Object.defineProperty(config, '__toggle', {
        configurable: false,
        enumerable: false,
        value: key,
      });

      return configBuilder;
    },
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
          config[property as keyof ZodTypes] = callback(config);
        }
      }

      return config;
    },
  } as unknown as ConfigBuilder;

  const jsonSchema = zodToJsonSchema(zodSchema) as JSONSchema7;

  for (const propertyName in jsonSchema.properties) {
    if (RESERVED_KEYWORDS.has(propertyName)) {
      throw new Error(
        `${propertyName} is a reserved keyword within the config builder. Please use a different property name.`
      );
    }

    const castProperty = propertyName as keyof RequiredZodTypes;
    const propertyDefinition = jsonSchema.properties[propertyName];

    if (typeof propertyDefinition === 'object' && propertyDefinition.default) {
      config[castProperty] = propertyDefinition.default as Config[keyof ZodTypes];
    }

    configBuilder[castProperty] = ((value: ZodTypes[keyof ZodTypes] | DerivedValueCallback) => {
      let propertyValue: ZodTypes[keyof ZodTypes];
      const MAX_DEPTH = 1;

      if (!isValidValue(value)) {
        throw new Error(
          `${String(
            castProperty
          )} value has a depth greater than ${MAX_DEPTH}. To pass in objects with a depth greater than ${MAX_DEPTH}, create a builder for that config slice.`
        );
      }

      if (typeof value === 'function') {
        const derivedValueCallback = value as DerivedValueCallback;
        callbacks[castProperty] = derivedValueCallback;
        propertyValue = derivedValueCallback(config);
      } else {
        propertyValue = value;
      }

      config[castProperty] = propertyValue;
      return configBuilder;
    }) as ConfigBuilder[keyof RequiredZodTypes];
  }

  return configBuilder;
};
