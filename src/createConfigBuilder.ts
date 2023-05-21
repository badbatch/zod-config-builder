import { type JSONSchema7 } from 'json-schema';
import { type ZodError, type z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { cloneConfig } from './utils/cloneConfig.ts';
import { isValidValue } from './utils/isValidValue.ts';

export const RESERVED_KEYWORDS = new Set([
  'disable',
  'errors',
  'experiment',
  'extend',
  'flush',
  'fork',
  'toJson',
  'validate',
  'values',
]);

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
) => {
  type Config = {
    [Key in keyof ZodTypes]: ZodTypes[Key];
  };

  type RequiredConfig = Required<Config>;
  type DerivedValueCallback<K extends keyof Config = keyof Config> = (c: Config) => Config[K];

  type ConfigBuilder = {
    [Key in keyof RequiredConfig]: (
      value: Config[Key] | DerivedValueCallback<Key>,
      override?: boolean
    ) => ConfigBuilder;
  } & {
    disable: () => ConfigBuilder;
    errors: () => ZodError['errors'];
    experiment: (key: string) => ConfigBuilder;
    extend: (configBuilder: ConfigBuilder) => ConfigBuilder;
    flush: () => Config;
    fork: () => ConfigBuilder;
    toJson: () => string;
    validate: () => boolean;
    values: () => Config;
  };

  let config = initialValues as Config;

  Object.defineProperty(config, '__zcb', {
    configurable: false,
    enumerable: false,
    value: true,
  });

  let callbacks: Partial<Record<keyof Config, DerivedValueCallback>> = { ...derivedValueCallbacks };

  const configBuilder = {
    disable: () => {
      Object.defineProperty(config, '__disabled', {
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
      Object.defineProperty(config, '__experiment', {
        configurable: false,
        enumerable: false,
        value: key,
      });

      return configBuilder;
    },
    extend: (configBuilder: ConfigBuilder) => {
      config = cloneConfig<Config>(configBuilder.values());
      // @ts-expect-error private property
      callbacks = { ...configBuilder.__callbacks } as Partial<Record<keyof Config, DerivedValueCallback>>;
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
    fork: () => createConfigBuilder<Config>(zodSchema, derivedValueCallbacks),
    toJson: () => JSON.stringify(configBuilder.values()),
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
  } as unknown as ConfigBuilder;

  Object.defineProperty(configBuilder, '__callbacks', {
    configurable: false,
    enumerable: false,
    value: callbacks,
  });

  const jsonSchema = zodToJsonSchema(zodSchema) as JSONSchema7;

  if (jsonSchema.type !== 'object') {
    throw new Error(`The root type of a config schema must be "object", but received "${String(jsonSchema.type)}"`);
  }

  for (const propertyName in jsonSchema.properties) {
    if (RESERVED_KEYWORDS.has(propertyName)) {
      throw new Error(
        `"${propertyName}" is a reserved keyword within the config builder. Please use a different property name. The full list of reserved keywords is: ${[
          ...RESERVED_KEYWORDS,
        ].join(', ')}`
      );
    }

    const castProperty = propertyName as keyof Config;
    const propertyDefinition = jsonSchema.properties[propertyName];

    if (typeof propertyDefinition === 'object' && propertyDefinition.default) {
      config[castProperty] = propertyDefinition.default as Config[keyof Config];
    }

    configBuilder[castProperty] = ((value: Config[keyof Config] | DerivedValueCallback, override?: boolean) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!override && config[castProperty] !== undefined) {
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

      if (typeof value === 'function') {
        const derivedValueCallback = value as DerivedValueCallback;
        callbacks[castProperty] = derivedValueCallback;
        propertyValue = derivedValueCallback(config);
      } else {
        propertyValue = value;
      }

      config[castProperty] = propertyValue;
      return configBuilder;
    }) as ConfigBuilder[keyof Config];
  }

  return configBuilder;
};
