// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isDerivedValueCallback = <T extends (c: any) => any>(value: any): value is T =>
  typeof value === 'function';
