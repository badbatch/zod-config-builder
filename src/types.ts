import { type List } from 'ts-toolbelt';
import { type Includes, type Join } from 'type-fest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export type Buckets<Config extends AnyRecord> = Record<string, Experiment<Config>>;

export interface ConfigParserOptions {
  experimentsCallback?: RunExperimentsCallback;
}

export interface Experiment<Config extends AnyRecord> {
  action?: TransformConfigHandlerAction;
  value?: Config;
}

export type NonEmumeralProperties = '__callbacks' | '__disabled' | '__experiment' | '__id' | '__type' | '__zcb';

export type Path<Config extends object> = Join<Leaves<Config>, '.'>;

export type RunExperimentsCallback = (id: string) => Promise<string>;

export type Scope<Config extends object> = Join<Paths<Config>, '.'>;

export type SetupExperimentsCallback = <Config extends AnyRecord>(
  id: string,
  clone: Config,
  config: Config,
) => Promise<Buckets<Config>>;

export type TransformConfigHandler = <Config extends AnyRecord>(
  clone: Config,
  config: Config,
) => TransformConfigHandlerReturnType<Config> | Promise<TransformConfigHandlerReturnType<Config>>;

export type TransformConfigHandlerSync = <Config extends AnyRecord>(
  clone: Config,
  config: Config,
) => TransformConfigHandlerReturnType<Config>;

export type TransformConfigHandlerAction = 'DELETE_NODE' | 'SKIP_NODE';

export interface TransformConfigHandlerReturnType<Config extends AnyRecord> {
  action?: TransformConfigHandlerAction;
  value?: Config;
}

export interface WriteConfigOptions {
  experimentsCallback?: SetupExperimentsCallback;
  outputFile: string;
}

export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];

export type IsArrayOfPrimitives<T> = T extends readonly (infer U)[]
  ? Exclude<U, Primitive> extends never
    ? true
    : false
  : false;

export type OwnKeys<T> = Exclude<
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in Extract<keyof T, string>]: T[K] extends (...args: any[]) => any ? never : K;
  }[Extract<keyof T, string>],
  `${string}[Symbol.${string}`
>;

export type Leaves<T, LeafPath extends string[] = [], Depth extends number = 10> = Depth extends never
  ? never
  : T extends Primitive
    ? LeafPath
    : IsArrayOfPrimitives<T> extends true
      ? LeafPath
      : {
          [K in OwnKeys<T>]: Leaves<T[K], [...LeafPath, K], Prev[Depth]>;
        }[OwnKeys<T>];

export type Paths<T, ScopePath extends string[] = [], Depth extends number = 10> = Depth extends never
  ? never
  : T extends Primitive
    ? never
    : ScopePath extends []
      ? { [K in OwnKeys<T>]: Paths<T[K], [K], Prev[Depth]> }[OwnKeys<T>]
      : ScopePath | { [K in OwnKeys<T>]: Paths<T[K], [...ScopePath, K], Prev[Depth]> }[OwnKeys<T>];

// This type is not used, but is left here for reference
export type LeavesScopeDiffs<T1 extends readonly string[][], T2 extends string[]> = {
  [K1 in keyof T1]: List.Length<List.Intersect<T1[K1], T2, '<-contains'>> extends 1
    ? List.Length<T1[K1]> extends 1
      ? Includes<T2, T1[K1][0]> extends false
        ? T1[K1]
        : never
      : List.Diff<T1[K1], T2>
    : never;
}[number];
