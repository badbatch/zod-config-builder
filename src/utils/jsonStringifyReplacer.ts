import type { Jsonifiable } from 'type-fest';
import { ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const jsonStringifyReplacer = (_key: string, value: Jsonifiable) =>
  value instanceof ZodType ? zodToJsonSchema(value, { errorMessages: true }) : value;
