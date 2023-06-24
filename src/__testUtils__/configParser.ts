import { createConfigParser } from '../createConfigParser.ts';
import buildConfig from './builtConfig.ts';

// eslint-disable-next-line import/no-default-export
export const config = await createConfigParser(buildConfig);
