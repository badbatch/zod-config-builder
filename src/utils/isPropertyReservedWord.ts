import { RESERVED_KEYWORDS } from '../createConfigBuilder.ts';

export const isPropertyReservedWord = (propertyName: string) => RESERVED_KEYWORDS.has(propertyName);
