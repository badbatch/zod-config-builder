import { runExperiments } from './transformers/runExperiments.ts';
import { type ConfigParserOptions, type TransformConfigHandler } from './types.ts';
import { transformConfig } from './utils/transformConfig.ts';

export const createConfigParser = async <Config extends object>(
  config: Config,
  { experimentsCallback }: ConfigParserOptions = {},
) => {
  const handlers: TransformConfigHandler[] = [];

  if (experimentsCallback) {
    handlers.push(runExperiments(experimentsCallback));
  }

  return handlers.length > 0 ? await transformConfig(config, handlers) : config;
};
