import { type AnyRecord, type TransformConfigHandlerSync } from '../types.ts';

const NON_ENUMERABLE_KEYS = ['__callbacks', '__disabled', '__experiment', '__id', '__type', '__zcb'];

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
        value: config[nonEnumerableKey],
      });
    }
  }

  return {
    value: clone,
  };
};
