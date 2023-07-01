import get from 'lodash/get.js';
import type { Get } from 'type-fest';
import type { Path, Scope } from './types.ts';

export const createConfigReader = <Config extends object>(config: Config) => {
  const configReader = <P extends Path<Config>>(path: P) => get(config, path);
  configReader.scope = <S extends Scope<Config>>(scope: S) => createConfigReader(get(config, scope) as Get<Config, S>);
  return configReader;
};
