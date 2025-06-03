import { get, isString } from 'lodash-es';
import { type Get } from 'type-fest';
import { type Path, type Scope } from './types.ts';

export interface ConfigReader<Config extends object> {
  read: <P extends Path<Config>>(path: P, variables?: Record<string, string | number>) => Get<Config, P>;
  scope: <S extends Scope<Config>>(scope: S) => ConfigReader<Get<Config, S>>;
}

export const createConfigReader = <Config extends object>(config: Config): ConfigReader<Config> => {
  // Aimed at reducing the amount of work for typescript to resolve type.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const configReader = {
    read: <P extends Path<Config>>(path: P, variables?: Record<string, string | number>) => {
      if (!variables) {
        return get(config, path);
      }

      const output = get(config, path);

      if (!isString(output)) {
        throw new Error(
          'config reader received variables to use in string template, but the path did not resolve to a string.',
        );
      }

      return Object.keys(variables).reduce<string>((acc, key) => {
        return acc.replace(new RegExp(`{{${key}}}`), String(variables[key]));
      }, output);
    },
    // Aimed at reducing the amount of work for typescript to resolve type.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    scope: <S extends Scope<Config>>(scope: S) => createConfigReader(get(config, scope) as Get<Config, S>),
  } as ConfigReader<Config>;

  return configReader;
};
