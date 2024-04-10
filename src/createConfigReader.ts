import { get, isString } from 'lodash-es';
import { type Get } from 'type-fest';
import { type Path, type Scope } from './types.ts';

export type ReadOptions = {
  vars?: Record<string, string | number>;
};

export interface ConfigReader<Config extends object> {
  read: <P extends Path<Config>>(path: P, options?: ReadOptions) => Get<Config, P>;
  scope: <S extends Scope<Config>>(scope: S) => ConfigReader<Get<Config, S>>;
}

export const createConfigReader = <Config extends object>(config: Config): ConfigReader<Config> => {
  const configReader = {
    read: <P extends Path<Config>>(path: P, { vars }: ReadOptions = {}) => {
      if (!vars) {
        return get(config, path);
      }

      const output = get(config, path);

      if (!isString(output)) {
        throw new Error(
          'config reader received variables to use in string template, but the path did not resolve to a string.'
        );
      }

      return Object.keys(vars).reduce<string>((acc, key) => {
        return acc.replace(new RegExp(`{{${key}}}`), String(vars[key]));
      }, output);
    },
    scope: <S extends Scope<Config>>(scope: S) => createConfigReader(get(config, scope) as Get<Config, S>),
  } as ConfigReader<Config>;

  return configReader;
};
