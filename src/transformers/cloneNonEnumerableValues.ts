import { type AnyRecord, NonEmumeralProperties, type TransformConfigHandlerSync } from '../types.ts';

const NON_ENUMERABLE_KEYS = new Set(Object.values(NonEmumeralProperties));

export const cloneNonEnumerableValues: TransformConfigHandlerSync = <
  Config1 extends AnyRecord,
  Config2 extends AnyRecord,
>(
  clone: Config1,
  config: Config2,
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
