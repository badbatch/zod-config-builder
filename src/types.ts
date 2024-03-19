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

export enum NonEmumeralProperties {
  CALLBACKS = '__callbacks',
  DISABLED = '__disabled',
  EXPERIMENT = '__experiment',
  ID = '__id',
  TYPE = '__type',
  ZCB = '__zcb',
}

export type Path<Config extends object> = Join<Leaves<Config>, '.'>;

export type RunExperimentsCallback = (id: string) => Promise<string>;

export type Scope<Config extends object> = Join<Paths<Config>, '.'>;

export type SetupExperimentsCallback = <Config extends AnyRecord>(
  id: string,
  clone: Config,
  config: Config
) => Promise<Buckets<Config>>;

export type TransformConfigHandler = <Config extends AnyRecord>(
  clone: Config,
  config: Config
) => TransformConfigHandlerReturnType<Config> | Promise<TransformConfigHandlerReturnType<Config>>;

export type TransformConfigHandlerSync = <Config extends AnyRecord>(
  clone: Config,
  config: Config
) => TransformConfigHandlerReturnType<Config>;

export enum TransformConfigHandlerAction {
  DELETE_NODE = 'deleteNode',
  SKIP_NODE = 'skipNode',
}

export interface TransformConfigHandlerReturnType<Config extends AnyRecord> {
  action?: TransformConfigHandlerAction;
  value?: Config;
}

export interface WriteConfigOptions {
  experimentsCallback?: SetupExperimentsCallback;
  outputFile: string;
}

export type Leaves<T, LeafPath extends string[] = []> = T extends string
  ? LeafPath
  : {
      [K in keyof T & string]: Leaves<T[K], [...LeafPath, K]>;
    }[keyof T & string];

export type Paths<T, LeafPath extends string[] = []> = T extends string
  ? LeafPath
  : {
      [K in keyof T & string]: T[K] extends object ? Paths<T[K], [...LeafPath, K]> : LeafPath;
    }[keyof T & string];

export type LeavesScopeDiffs<T1 extends readonly string[][], T2 extends string[]> = {
  [K1 in keyof T1]: List.Length<List.Intersect<T1[K1], T2, '<-contains'>> extends 1
    ? List.Length<T1[K1]> extends 1
      ? Includes<T2, T1[K1][0]> extends false
        ? T1[K1]
        : never
      : List.Diff<T1[K1], T2>
    : never;
}[number];
