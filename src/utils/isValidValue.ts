import isPlainObject from 'lodash/isPlainObject.js';

export const isValidValue = (value: unknown, depth = 0): boolean => {
  if (isPlainObject(value)) {
    const object = value as Record<string, unknown>;

    if (object.__zcb === true) {
      return true;
    }

    if (depth < 1 && Object.values(object).every(v => isValidValue(v, depth + 1))) {
      return true;
    }

    return false;
  }

  if (Array.isArray(value)) {
    if (value.every(v => isValidValue(v, depth + 1))) {
      return true;
    }

    return false;
  }

  return true;
};
