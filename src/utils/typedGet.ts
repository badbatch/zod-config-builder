import { stringToPath } from 'remeda';
import { type Get } from 'type-fest';

export const get = <Config extends object, Path extends string>(config: Config, path: Path): Get<Config, Path> => {
  const keys = Reflect.has(config, path) ? [path] : stringToPath<string>(path);

  const value = keys.reduce<unknown>((current, key) => {
    if (current === null || current === undefined) {
      return;
    }

    return Reflect.get(new Object(current), key);
  }, config);

  // The runtime path lookup cannot infer the value type for a generic path.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return value as Get<Config, Path>;
};
