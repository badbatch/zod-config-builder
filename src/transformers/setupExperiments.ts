import type { AnyRecord, ExperimentsCallback, TransformConfigHandler } from '../types.ts';

export const setupExperiments =
  (callback: ExperimentsCallback): TransformConfigHandler =>
  async <Config extends AnyRecord>(clone: Config, config: Config) => {
    if ('__experiment' in config && typeof config.__experiment === 'string') {
      const { action, value = {} } = await callback(config.__experiment, clone, config);

      // @ts-expect-error private property
      clone.__experiment = {
        action,
        id: config.__experiment,
        value,
      };

      return {
        value: clone,
      };
    }

    return {
      value: clone,
    };
  };
