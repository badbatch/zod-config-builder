import { isArray } from 'remeda';

export const castArray = <T>(value: T | readonly T[]): T[] => (isArray(value) ? [...value] : [value]);
