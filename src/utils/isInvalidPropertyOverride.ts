// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isInvalidPropertyOverride = (propertyValue: any, override = false) =>
  !override && propertyValue !== undefined;
