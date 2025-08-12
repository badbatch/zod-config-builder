import { castArray, isPlainObject } from 'lodash-es';
import { type AnyRecord, type TransformConfigHandler, type TransformConfigHandlerSync } from '../types.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformArray = (list: any[], handler: TransformConfigHandler | TransformConfigHandler[]): Promise<any[]> =>
  Promise.all(
    list.map(entry => {
      if (isPlainObject(entry)) {
        return transformConfig(entry, handler);
      }

      if (Array.isArray(entry)) {
        return transformArray(entry, handler);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return entry;
    }),
  );

export const transformConfig = async <Config extends AnyRecord>(
  config: Config,
  handler: TransformConfigHandler | TransformConfigHandler[] = [],
): Promise<Config> => {
  // Typing gets too complicated without casting.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let transform = {} as Config;
  const handlers = castArray(handler);

  for (const callback of handlers) {
    const result = await Promise.resolve(callback(transform, config));

    if (result.action === 'DELETE_NODE') {
      // Typing gets too complicated without casting.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {} as Config;
    }

    if (result.value) {
      transform = result.value;
    }

    if (result.action === 'SKIP_NODE') {
      return transform;
    }
  }

  for (const key in config) {
    const value = config[key];

    if (isPlainObject(value)) {
      transform[key] = await transformConfig(value, handler);
    } else if (Array.isArray(value)) {
      // transformArraySync returns an any type.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      transform[key] = (await transformArray(value, handler)) as Config[Extract<keyof Config, string>];
    } else {
      transform[key] = value;
    }
  }

  return transform;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformArraySync = (list: any[], handler: TransformConfigHandlerSync | TransformConfigHandlerSync[]): any[] =>
  list.map(entry => {
    if (isPlainObject(entry)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return transformConfigSync(entry, handler);
    }

    if (Array.isArray(entry)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return transformArraySync(entry, handler);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return entry;
  });

export const transformConfigSync = <Config extends AnyRecord>(
  config: Config,
  handler: TransformConfigHandlerSync | TransformConfigHandlerSync[] = [],
): Config => {
  // Typing gets too complicated without casting.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let transform = {} as Config;
  const handlers = castArray(handler);

  for (const callback of handlers) {
    const result = callback(transform, config);

    if (result.action === 'DELETE_NODE') {
      // Typing gets too complicated without casting.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {} as Config;
    }

    if (result.value) {
      transform = result.value;
    }

    if (result.action === 'SKIP_NODE') {
      return transform;
    }
  }

  for (const key in config) {
    const value = config[key];

    if (isPlainObject(value)) {
      transform[key] = transformConfigSync(value, handler);
    } else if (Array.isArray(value)) {
      // transformArraySync returns an any type.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      transform[key] = transformArraySync(value, handler) as Config[Extract<keyof Config, string>];
    } else {
      transform[key] = value;
    }
  }

  return transform;
};
