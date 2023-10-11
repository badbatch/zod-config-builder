import { get } from 'lodash-es';
import type { Get } from 'type-fest';
import type { Path, Scope } from './types.ts';

export interface ConfigReader<Config extends object> {
  read: <P extends Path<Config>>(path: P) => Get<Config, P>;
  scope: <S extends Scope<Config>>(scope: S) => ConfigReader<Get<Config, S>>;
}

export const createConfigReader = <Config extends object>(config: Config): ConfigReader<Config> => {
  const configReader = {
    read: <P extends Path<Config>>(path: P) => get(config, path),
    scope: <S extends Scope<Config>>(scope: S) => createConfigReader(get(config, scope) as Get<Config, S>),
  } as ConfigReader<Config>;

  return configReader;
};
