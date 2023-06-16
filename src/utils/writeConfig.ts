import { outputFileSync } from 'fs-extra/esm';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import shelljs from 'shelljs';
import { removeDisabledSlices } from '../transformers/removeDisabledSlices.ts';
import { setupExperiments } from '../transformers/setupExperiments.ts';
import type { TransformConfigHandler, WriteConfigOptions } from '../types.ts';
import { transformConfig } from './transformConfig.ts';

export const writeConfig = async <Config extends object>(
  config: Config,
  { experimentsCallback, outputFile }: WriteConfigOptions
) => {
  const handlers: TransformConfigHandler[] = [removeDisabledSlices];

  if (experimentsCallback) {
    handlers.push(setupExperiments(experimentsCallback));
  }

  const template = Handlebars.compile(
    readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './templates/config.ts.hbs'), { encoding: 'utf8' })
  );

  const output = template({ config: JSON.stringify(await transformConfig(config, handlers), undefined, 2) }).replaceAll(
    /"([A-Za-z][\dA-Za-z]+)":/g,
    '$1:'
  );

  shelljs.echo(`zcd watch => writing to file: ${outputFile}`);
  shelljs.echo(`zcd watch => content to write:\n${output}\n`);
  outputFileSync(resolve(process.cwd(), outputFile), output);
};
