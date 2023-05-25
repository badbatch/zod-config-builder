import get from 'lodash/get.js';
import type { Get, Join } from 'type-fest';
import type { Leaves, Paths } from './types.ts';

export const createConfigReader = <Config extends object>(config: Config) => {
  const configReader = <Path extends Join<Leaves<Config>, '.'>>(path: Path) => get(config, path);

  configReader.scope = <Scope extends Join<Paths<Config>, '.'>>(scope: Scope) =>
    createConfigReader(get(config, scope) as Get<Config, Scope>);

  return configReader;
};
