import { createConfigParser } from '../createConfigParser.ts';
import { createConfigReader } from '../createConfigReader.ts';
import buildConfig from './builtConfig.ts';

const config = await createConfigParser(buildConfig);

export const createReader = () => createConfigReader(config);
