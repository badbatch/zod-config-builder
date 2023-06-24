import { watchFile } from 'node:fs';
import { resolve } from 'node:path';
import shelljs from 'shelljs';
import yargs from 'yargs';
import { importValidateTransformWriteConfig } from './utils/importValidateTransformWriteConfig.ts';

export enum Commands {
  BUILD = 'build',
  WATCH = 'watch',
}

const generateArguments = (cmdYargs: yargs.Argv) =>
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
  yargs
    .command(
      'watch <input-file> <output-file>',
      'Watch a config builder and write config',
      cmdYargs => generateArguments(cmdYargs),
      argv => {
        shelljs.echo(`zcd watch => watching file: ${argv['input-file']}`);

        watchFile(resolve(process.cwd(), argv['input-file']), () => {
          shelljs.echo('zcd watch => file change detected');

          importValidateTransformWriteConfig(
            argv['input-file'],
            argv['output-file'],
            Commands.WATCH,
            argv['experiments-callback-file']
          );
        });
      }
    )
    .command(
      'build <input-file> <output-file>',
      'Write config from a config builder',
      cmdYargs => generateArguments(cmdYargs),
      argv => {
        shelljs.echo(`zcd build => building file: ${argv['input-file']}`);

        importValidateTransformWriteConfig(
          argv['input-file'],
          argv['output-file'],
          Commands.BUILD,
          argv['experiments-callback-file']
        );
      }
    )
    .help().argv;
};
