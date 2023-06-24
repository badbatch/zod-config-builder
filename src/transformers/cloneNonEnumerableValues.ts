import { type AnyRecord, NonEmumeralProperties, type TransformConfigHandlerSync } from '../types.ts';

const NON_ENUMERABLE_KEYS = new Set(Object.values(NonEmumeralProperties));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cloneNonEnumerableValues: TransformConfigHandlerSync = <Config extends AnyRecord>(
  clone: Config,
  config: Config
) => {
  for (const nonEnumerableKey of NON_ENUMERABLE_KEYS) {
    if (nonEnumerableKey in config) {
      Object.defineProperty(clone, nonEnumerableKey, {
        configurable: false,
        enumerable: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: config[nonEnumerableKey],
      });
    }
  }

  return {
    value: clone,
  };
};
