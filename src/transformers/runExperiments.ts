import {
  type AnyRecord,
  type Buckets,
  type RunExperimentsCallback,
  type TransformConfigHandler,
  type TransformConfigHandlerReturnType,
} from '../types.ts';

export const runExperiments =
  (callback: RunExperimentsCallback): TransformConfigHandler =>
  async <Config extends AnyRecord>(
    clone: Config,
    config: Config,
  ): Promise<TransformConfigHandlerReturnType<Config>> => {
    if ('__experiment' in config && typeof config.__experiment === 'object') {
      // As __experiment is private property, TypeScript doesn't know what type is.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const { buckets, id } = config.__experiment as { buckets: Buckets<Config>; id: string };
      const bucket = await callback(id);

      if (Object.hasOwn(buckets, bucket)) {
        // The check above essentially makes sure the value cannot be null
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return buckets[bucket]!;
      }
    }

    return {
      value: clone,
    };
  };
