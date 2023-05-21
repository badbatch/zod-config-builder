import isPlainObject from 'lodash/isPlainObject.js';

const NON_ENUMERABLE_KEYS = new Set(['__disabled', '__toggle', '__zcb']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cloneArray = (list: any[]): any[] =>
  list.map(entry => {
    if (isPlainObject(entry)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cloneConfig(entry);
    }

    if (Array.isArray(entry)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cloneArray(entry);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return entry;
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cloneConfig = <T extends Record<string, any>>(config: T): T => {
  const clone = {} as T;

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

  for (const key in config) {
    const value = config[key];

    if (isPlainObject(value)) {
      clone[key] = cloneConfig(value);
    } else if (Array.isArray(value)) {
      clone[key] = cloneArray(value) as T[Extract<keyof T, string>];
    } else {
      clone[key] = value;
    }
  }

  return clone;
};
