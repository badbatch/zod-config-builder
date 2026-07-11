import { outputFileSync } from 'fs-extra/esm';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import shelljs from 'shelljs';
import { removeDisabledSlices } from '../transformers/removeDisabledSlices.ts';
import { setupExperiments } from '../transformers/setupExperiments.ts';
import { type TransformConfigHandler, type WriteConfigOptions } from '../types.ts';
import { transformConfig } from './transformConfig.ts';

export const transformWriteConfig = async <Config extends object>(
  config: Config,
  { experimentsCallback, outputFile }: WriteConfigOptions,
): Promise<void> => {
  const handlers: TransformConfigHandler[] = [removeDisabledSlices];

  if (experimentsCallback) {
    handlers.push(setupExperiments(experimentsCallback));
  }

  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const template = Handlebars.compile(
    readFileSync(path.resolve(dirname, '../templates/config.ts.hbs'), { encoding: 'utf8' }),
  );

  const output = template({
    config: JSON.stringify(
      await transformConfig(config, handlers),
      (_k, v: unknown) => (v === undefined ? 'undefined' : v),
      2,
    ),
  })
    .replaceAll(/"([A-Za-z][\dA-Za-z]+)":/g, '$1:')
    .replaceAll('"undefined"', 'undefined');

  shelljs.echo(`zcd watch => writing to file: ${outputFile}`);
  shelljs.echo(`zcd watch => content to write:\n${output}\n`);
  outputFileSync(path.resolve(process.cwd(), outputFile), output);
};
