import { watchFile } from 'node:fs';
import { resolve } from 'node:path';
import shelljs from 'shelljs';
import yargs, { type Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { importValidateTransformWriteConfig } from './utils/importValidateTransformWriteConfig.ts';

export enum Commands {
  BUILD = 'build',
  WATCH = 'watch',
}

const generateArguments = (cmdYargs: Argv) =>
  cmdYargs
    .positional('input-file', {
      demandOption: true,
      desc: 'The relative path to the config builder root file',
      type: 'string',
    })
    .positional('output-file', {
      demandOption: true,
      desc: 'The relative path to the output config file',
      type: 'string',
    })
    .option('experiments-callback-file', {
      desc: 'The relative path to the experiment callback file',
      type: 'string',
    });

export const cli = () => {
  // yargs does not provide a way to pass generic to type args.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const argv = yargs(hideBin(process.argv)) as Argv<{
    'experiments-callback-file'?: string;
    'input-file': string;
    'output-file': string;
  }>;

  void argv
    .command(
      'watch <input-file> <output-file>',
      'Watch a config builder and write config',
      cmdYargs => generateArguments(cmdYargs),
      cmdYargs => {
        shelljs.echo(`zcd watch => watching file: ${cmdYargs['input-file']}`);

        watchFile(resolve(process.cwd(), cmdYargs['input-file']), () => {
          shelljs.echo('zcd watch => file change detected');

          importValidateTransformWriteConfig(
            cmdYargs['input-file'],
            cmdYargs['output-file'],
            Commands.WATCH,
            cmdYargs['experiments-callback-file'],
          );
        });
      },
    )
    .command(
      'build <input-file> <output-file>',
      'Write config from a config builder',
      cmdYargs => generateArguments(cmdYargs),
      cmdYargs => {
        shelljs.echo(`zcd build => building file: ${cmdYargs['input-file']}`);

        importValidateTransformWriteConfig(
          cmdYargs['input-file'],
          cmdYargs['output-file'],
          Commands.BUILD,
          cmdYargs['experiments-callback-file'],
        );
      },
    )
    .help()
    .parseAsync();
};
