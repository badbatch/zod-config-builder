import { type AnyRecord, type Buckets, type RunExperimentsCallback, type TransformConfigHandler } from '../types.ts';

export const runExperiments =
  (callback: RunExperimentsCallback): TransformConfigHandler =>
  async <Config extends AnyRecord>(clone: Config, config: Config) => {
    if ('__experiment' in config && typeof config.__experiment === 'object') {
      // As __experiment is private property, Typescript doesn't know what type is.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const { buckets, id } = config.__experiment as { buckets: Buckets<Config>; id: string };
      const bucket = await callback(id);

      if (bucket && bucket in buckets && buckets[bucket]) {
        return buckets[bucket];
      }
    }

    return {
      value: clone,
    };
  };
