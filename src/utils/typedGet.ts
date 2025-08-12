import { get as untypedGet } from 'lodash-es';
import { type Get } from 'type-fest';

export const get = <T extends object, P extends string>(obj: T, path: P): Get<T, P> => {
  // Lodash get built-in typing is not very good.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return untypedGet(obj, path) as Get<T, P>;
};
