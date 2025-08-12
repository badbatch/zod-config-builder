import { isPlainObject, isString } from 'lodash-es';
import { type Get } from 'type-fest';
import { type Path, type Scope } from './types.ts';
import { get } from './utils/typedGet.ts';

export interface ConfigReader<Config extends object> {
  read: <P extends Path<Config>>(path: P, variables?: Record<string, string | number>) => Get<Config, P>;
  scope: <S extends Scope<Config>>(scope: S) => ConfigReader<Get<Config, S>>;
}

export const createConfigReader = <Config extends object>(config: Config): ConfigReader<Config> => {
  // Aimed at reducing the amount of work for typescript to resolve type.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    read: <P extends Path<Config>>(path: P, variables?: Record<string, string | number>) => {
      const output = get(config, path);

      if (isPlainObject(output) || (Array.isArray(output) && output.some(entry => isPlainObject(entry)))) {
        throw new Error(
          'Path resolved to an object or an array of objects, but `read` can only resolve to a primitive value or an array of primitives. Use the `scope` method instead.',
        );
      }

      if (!variables) {
        return output;
      }

      if (!isString(output)) {
        throw new Error(
          'Config reader received variables to use in string template, but the path did not resolve to a string.',
        );
      }

      return Object.keys(variables).reduce<string>((acc, key) => {
        return acc.replace(new RegExp(`{{${key}}}`), String(variables[key]));
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
