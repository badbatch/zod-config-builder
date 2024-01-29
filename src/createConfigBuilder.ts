import { type JSONSchema7 } from 'json-schema';
import { cloneDeep, merge } from 'lodash-es';
import { v4 as uuidV4 } from 'uuid';
import { type ZodError, type z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { cloneNonEnumerableValues } from './transformers/cloneNonEnumerableValues.ts';
import { NonEmumeralProperties } from './types.ts';
import { collateDefaultValues } from './utils/collateDefaultValues.ts';
import { isDerivedValueCallback } from './utils/isDerivedValueCallback.ts';
import { isInvalidPropertyOverride } from './utils/isInvalidPropertyOverride.ts';
import { RESERVED_KEYWORDS, isPropertyReservedWord } from './utils/isPropertyReservedWord.ts';
import { isSchemaValid } from './utils/isSchemaValid.ts';
import { isValidValue } from './utils/isValidValue.ts';
import { jsonStringifyReplacer } from './utils/jsonStringifyReplacer.ts';
import { transformConfigSync } from './utils/transformConfig.ts';

export type ConfigBuilder<ZodTypes> = {
  [Key in keyof Required<ZodTypes>]: (
    value: ZodTypes[Key] | ((c: ZodTypes) => ZodTypes[Key]),
    override?: boolean
  ) => ConfigBuilder<ZodTypes>;
} & {
  $disable: () => ConfigBuilder<ZodTypes>;
  $errors: () => ZodError['errors'];
  $experiment: (key: string) => ConfigBuilder<ZodTypes>;
  $extend: (configBuilder: ConfigBuilder<ZodTypes>) => ConfigBuilder<ZodTypes>;
  $flush: () => ZodTypes;
  $fork: () => ConfigBuilder<ZodTypes>;
  $toJson: () => string;
  $validate: () => boolean;
  $values: () => ZodTypes;
};

export type CreateConfigBuilderOptions = {
  overrides?: {
    uuid?: () => string;
  };
  type?: string;
};

export const createConfigBuilder = <ZodTypes>(
  zodSchema: z.ZodSchema,
  options: CreateConfigBuilderOptions = {},
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

  const jsonSchema = zodToJsonSchema(zodSchema) as JSONSchema7;

  if (isSchemaValid(jsonSchema)) {
    throw new Error(`The root type of a config schema must be "object", but received "${String(jsonSchema.type)}"`);
  }

  const uuid = options.overrides?.uuid ?? uuidV4;

  const addNonEnumeralBaseProperties = (conf: Config) => {
    Object.defineProperty(conf, NonEmumeralProperties.ZCB, {
      configurable: false,
      enumerable: false,
      value: true,
    });

    Object.defineProperty(conf, NonEmumeralProperties.ID, {
      configurable: false,
      enumerable: false,
      value: uuid(),
    });

    if (options.type) {
      Object.defineProperty(conf, NonEmumeralProperties.TYPE, {
        configurable: false,
        enumerable: false,
        value: options.type,
      });
    }
  };

  const createInitialConfig = () => {
    const config = merge(cloneDeep(initialValues), collateDefaultValues(jsonSchema)) as Config;
    addNonEnumeralBaseProperties(config);
    return config;
  };

  let config = createInitialConfig();
  let callbacks: Partial<Record<keyof Config, DerivedValueCallback>> = { ...derivedValueCallbacks };

  const configBuilder = {
    $disable: () => {
      Object.defineProperty(config, NonEmumeralProperties.DISABLED, {
        configurable: false,
        enumerable: false,
        value: true,
      });

      return configBuilder;
    },
    $errors: () => {
      try {
        zodSchema.parse(configBuilder.$values());
        return [];
      } catch (error: unknown) {
        return (error as ZodError).errors;
      }
    },
    $experiment: (key: string) => {
      Object.defineProperty(config, NonEmumeralProperties.EXPERIMENT, {
        configurable: false,
        enumerable: false,
        value: key,
      });

      return configBuilder;
    },
    $extend: (builder: ConfigBuilder<Config>) => {
      config = transformConfigSync<Config>(builder.$values(), [cloneNonEnumerableValues]);
      // @ts-expect-error private property
      callbacks = { ...builder.__callbacks } as Partial<Record<keyof Config, DerivedValueCallback>>;
    },
    $flush: () => {
      const values = configBuilder.$values();
      config = createInitialConfig();
      return values;
    },
    $fork: () => createConfigBuilder<Config>(zodSchema, options, derivedValueCallbacks, initialValues),
    $toJson: () => JSON.stringify(configBuilder.$values(), jsonStringifyReplacer, 2),
    $validate: () => {
      try {
        zodSchema.parse(configBuilder.$values());
        return true;
      } catch (error: unknown) {
        console.error(error);
        return false;
      }
    },
    $values: () => {
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

  for (const propertyName in jsonSchema.properties) {
    if (isPropertyReservedWord(propertyName)) {
      throw new Error(
        `"${propertyName}" is a reserved keyword within the config builder. Please use a different property name. The full list of reserved keywords is: ${[
          ...RESERVED_KEYWORDS,
        ].join(', ')}`
      );
    }

    const castPropertyName = propertyName as keyof Config;

    configBuilder[castPropertyName] = ((value: Config[keyof Config] | DerivedValueCallback, override?: boolean) => {
      if (isInvalidPropertyOverride(config[castPropertyName], override)) {
        throw new Error(
          `A value already exists for "${String(
            castPropertyName
          )}". You may be trying to add a new values before flushing the old one. If you intended to override the existing value, pass in true as the second argument.`
        );
      }

      let propertyValue: Config[keyof Config];
      const MAX_DEPTH = 1;

      if (!isValidValue(value)) {
        throw new Error(
          `"${String(
            castPropertyName
          )}" value has a depth greater than ${MAX_DEPTH}. To pass in objects with a depth greater than ${MAX_DEPTH}, create a builder for that config slice.`
        );
      }

      if (isDerivedValueCallback<DerivedValueCallback>(value)) {
        callbacks[castPropertyName] = value;
        propertyValue = value(config);
      } else {
        propertyValue = value;
      }

      config[castPropertyName] = propertyValue;
      return configBuilder;
    }) as ConfigBuilder<Config>[keyof Config];
  }

  return configBuilder;
};
