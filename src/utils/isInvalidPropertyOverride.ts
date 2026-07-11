// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isInvalidPropertyOverride = (propertyValue: any, override = false): boolean =>
  !override && propertyValue !== undefined;
