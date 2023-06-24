import {
  type AnyRecord,
  NonEmumeralProperties,
  type SetupExperimentsCallback,
  type TransformConfigHandler,
} from '../types.ts';

export const setupExperiments =
  (callback: SetupExperimentsCallback): TransformConfigHandler =>
  async <Config extends AnyRecord>(clone: Config, config: Config) => {
    if (NonEmumeralProperties.EXPERIMENT in config && typeof config.__experiment === 'string') {
      const buckets = await callback(config.__experiment, clone, config);

      // @ts-expect-error private property
      clone.__experiment = {
        buckets,
        id: config.__experiment,
      };

      return {
        value: clone,
      };
    }

    return {
      value: clone,
    };
  };
