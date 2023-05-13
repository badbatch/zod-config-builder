import { type JSONSchema7 } from 'json-schema';
import { type ZodError, type z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const createConfigBuilder = <ZodTypes>(zodSchema: z.ZodSchema) => {
  const jsonSchema = zodToJsonSchema(zodSchema) as JSONSchema7;

  type ConfigBuilder = {
    [Key in keyof ZodTypes]: ZodTypes[Key];
  } & {
    getErrors: () => ZodError['errors'];
    toJs: () => ZodTypes;
    toJson: () => string;
    validate: (fields?: string | string[]) => boolean;
  };

  const config = {} as ZodTypes;

  const configBuilder = {
    getErrors: () => {
      try {
        zodSchema.parse(config);
        return [];
      } catch (error: unknown) {
        return (error as ZodError).errors;
      }
    },
    toJs: () => config,
    toJson: () => JSON.stringify(config),
    validate: () => {
      try {
        zodSchema.parse(config);
        return true;
      } catch {
        return false;
      }
    },
  } as unknown as ConfigBuilder;

  for (const propertyName in jsonSchema.properties) {
    const castProperty = propertyName as keyof ZodTypes;
    const propertyDefinition = jsonSchema.properties[propertyName];

    if (typeof propertyDefinition === 'object' && propertyDefinition.default) {
      config[castProperty] = propertyDefinition.default as ZodTypes[keyof ZodTypes];
    }

    Object.defineProperty(configBuilder, castProperty, {
      get() {
        const configValue = config[castProperty];
        return typeof configValue === 'function' ? configValue(config) : configValue;
      },
      set(value) {
        config[castProperty] = typeof value === 'function' ? value(jsonSchema.properties![propertyName]) : value;
      },
    });

    // configBuilder[castProperty] = value => {
    //   config[castProperty] = typeof value === 'function' ? value(jsonSchema.properties![propertyName]) : value;
    // };
  }

  return configBuilder;
};
