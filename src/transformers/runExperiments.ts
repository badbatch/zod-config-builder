import {
  type AnyRecord,
  type Buckets,
  NonEmumeralProperties,
  type RunExperimentsCallback,
  type TransformConfigHandler,
} from '../types.ts';

export const runExperiments =
  (callback: RunExperimentsCallback): TransformConfigHandler =>
  async <Config extends AnyRecord>(clone: Config, config: Config) => {
    if (NonEmumeralProperties.EXPERIMENT in config && typeof config.__experiment === 'object') {
      const { buckets, id } = config.__experiment as { buckets: Buckets<Config>; id: string };
      const bucket = await callback(id);

      if (bucket && bucket in buckets && buckets[bucket]) {
        return buckets[bucket]!;
      }
    }

    return {
      value: clone,
    };
  };
