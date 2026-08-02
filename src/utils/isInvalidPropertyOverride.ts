// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isInvalidPropertyOverride = (propertyValue: any, isOverride = false): boolean =>
  !isOverride && propertyValue !== undefined;
