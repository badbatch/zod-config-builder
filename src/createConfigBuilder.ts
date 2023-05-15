import { type JSONSchema7 } from 'json-schema';
import isPlainObject from 'lodash/isPlainObject.js';
import { type ZodError, type z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const isValidValue = (value: unknown, depth = 0): boolean => {
  if (isPlainObject(value)) {
    const object = value as Record<string, unknown>;

    if (object.__marker === 'zcb') {
      return true;
    }

    if (depth < 1 && Object.values(object).every(v => isValidValue(v, depth + 1))) {
      return true;
    }

    return false;
  }

  if (Array.isArray(value)) {
    if (value.every(v => isValidValue(v, depth))) {
      return true;
    }

    return false;
  }

  return true;
};

export const createConfigBuilder = <ZodTypes>(zodSchema: z.ZodSchema) => {
  const jsonSchema = zodToJsonSchema(zodSchema) as JSONSchema7;

  type Config = {
    [Key in keyof ZodTypes]: ZodTypes[Key];
  };

  type RequiredZodTypes = Required<ZodTypes>;

  type ConfigBuilder = {
    [Key in keyof RequiredZodTypes]: (v: ZodTypes[Key] | ((c: Config) => ZodTypes[Key])) => ConfigBuilder;
  } & {
    config: () => ZodTypes;
    getErrors: () => ZodError['errors'];
    passThrough: (v: ZodTypes) => ZodTypes;
    toJson: () => string;
    validate: () => boolean;
  };

  type CallbackWithConfig = (c: Config) => ZodTypes[keyof ZodTypes];

  const configCallbacks: Partial<Record<keyof ZodTypes, CallbackWithConfig>> = {};
  const config = {} as Config;

  Object.defineProperty(config, '__marker', {
    configurable: false,
    enumerable: false,
    value: 'zcb',
  });

  const configBuilder = {
    config: () => {
      for (const property in configCallbacks) {
        const callback = configCallbacks[property];

        if (callback) {
          config[property as keyof ZodTypes] = callback(config);
        }
      }

      return config;
    },
    getErrors: () => {
      try {
        zodSchema.parse(configBuilder.config());
        return [];
      } catch (error: unknown) {
        return (error as ZodError).errors;
      }
    },
    passThrough: (v: ZodTypes) => {
      Object.defineProperty(v, '__marker', {
        configurable: false,
        enumerable: false,
        value: 'zcb',
      });

      return v;
    },
    toJson: () => JSON.stringify(configBuilder.config()),
    validate: () => {
      try {
        zodSchema.parse(configBuilder.config());
        return true;
      } catch (error: unknown) {
        console.error(error);
        return false;
      }
    },
  } as unknown as ConfigBuilder;

  for (const propertyName in jsonSchema.properties) {
    const castProperty = propertyName as keyof RequiredZodTypes;
    const propertyDefinition = jsonSchema.properties[propertyName];

    if (typeof propertyDefinition === 'object' && propertyDefinition.default) {
      config[castProperty] = propertyDefinition.default as Config[keyof ZodTypes];
    }

    configBuilder[castProperty] = ((value: ZodTypes[keyof ZodTypes] | CallbackWithConfig) => {
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
        const callbackWithConfig = value as CallbackWithConfig;
        configCallbacks[castProperty] = callbackWithConfig;
        propertyValue = callbackWithConfig(config);
      } else {
        propertyValue = value;
      }

      config[castProperty] = propertyValue;
      return configBuilder;
    }) as ConfigBuilder[keyof RequiredZodTypes];
  }

  return configBuilder;
};
