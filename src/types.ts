import type { List } from 'ts-toolbelt';
import type { Includes } from 'type-fest';

export type Leaves<T, Path extends string[] = []> = T extends string
  ? Path
  : {
      [K in keyof T & string]: Leaves<T[K], [...Path, K]>;
    }[keyof T & string];

export type Paths<T, Path extends string[] = []> = T extends string
  ? Path
  : {
      [K in keyof T & string]: T[K] extends object ? Paths<T[K], [...Path, K]> : Path;
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
