export const RESERVED_KEYWORDS = new Set([
  'disable',
  'errors',
  'experiment',
  'extend',
  'flush',
  'fork',
  'toJson',
  'validate',
  'values',
]);

export const isPropertyReservedWord = (propertyName: string) => RESERVED_KEYWORDS.has(propertyName);
