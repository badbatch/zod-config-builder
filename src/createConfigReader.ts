import { isPlainObject, isString } from 'lodash-es';
import { type Get } from 'type-fest';
import { type Path, type Scope } from './types.ts';
import { get } from './utils/typedGet.ts';

type PlaceholderNames<Value> = Value extends string
  ? Value extends `${string}{{${infer Name}}}${infer Rest}`
    ? Name | PlaceholderNames<Rest>
    : never
  : never;

type TemplateVariables<Value> = [PlaceholderNames<Value>] extends [never]
  ? [variables?: Record<string, string | number>]
  : [variables: Record<string, string | number> & Record<PlaceholderNames<Value>, string | number>];

export interface ConfigReader<Config extends object> {
  read: <P extends Path<Config>>(path: P, ...variables: TemplateVariables<Get<Config, P>>) => Get<Config, P>;
  scope: <S extends Scope<Config>>(scope: S) => ConfigReader<Get<Config, S>>;
}

export const createConfigReader = <Config extends object>(config: Config): ConfigReader<Config> => {
  // Aimed at reducing the amount of work for TypeScript to resolve type.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    read: <P extends Path<Config>>(path: P, ...variables: TemplateVariables<Get<Config, P>>) => {
      const [templateVariables] = variables;
      const output = get(config, path);

      if (isPlainObject(output) || (Array.isArray(output) && output.some(entry => isPlainObject(entry)))) {
        throw new Error(
          'Path resolved to an object or an array of objects, but `read` can only resolve to a primitive value or an array of primitives. Use the `scope` method instead.',
        );
      }

      if (!templateVariables) {
        return output;
      }

      if (!isString(output)) {
        throw new Error(
          'Config reader received variables to use in string template, but the path did not resolve to a string.',
        );
      }

      return Object.keys(templateVariables).reduce<string>((acc, key) => {
        return acc.replace(new RegExp(`{{${key}}}`), () => String(templateVariables[key]));
      }, output);
    },
    scope: <S extends Scope<Config>>(scope: S) => {
      const output = get(config, scope);

      if (!isPlainObject(output) && !(Array.isArray(output) && output.some(entry => isPlainObject(entry)))) {
        throw new Error(
          'Path resolved to a primitive or an array of primitive, but `scope` can only resolve to an object or an array of object. Use the `read` method instead.',
        );
      }

      return createConfigReader(output);
    },
  } as ConfigReader<Config>;
};
