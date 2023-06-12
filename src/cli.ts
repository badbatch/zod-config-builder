import { watchFile } from 'node:fs';
import { resolve } from 'node:path';
import shelljs from 'shelljs';
import yargs from 'yargs';
import type { ExperimentsCallback } from './types.ts';
import { writeConfig } from './utils/writeConfig.ts';

export const cli = () => {
  yargs
    .command(
      'watch <inputFile> <outputFile>',
      'watch a config builder and write ',
      cmdYargs =>
        cmdYargs
          .positional('inputFile', {
            demandOption: true,
            desc: 'The relative path to the config builder root file',
            type: 'string',
          })
          .positional('outputFile', {
            demandOption: true,
            desc: 'The relative path to the output config file',
            type: 'string',
          })
          .option('experiments-callback', {
            desc: 'The relative path to the experiment callback file',
            type: 'string',
          }),
      argv => {
        const fullWatchFilePath = resolve(process.cwd(), argv.inputFile);
        shelljs.echo(`zcd watch => watching file: ${argv.inputFile}`);

        watchFile(fullWatchFilePath, () => {
          import(fullWatchFilePath)
            .then(
              ({
                default: configBuilder,
              }: {
                default: ReturnType<typeof import('./createConfigBuilder.ts')['createConfigBuilder']>;
              }) => {
                shelljs.echo('zcd watch => file change detected');

                if (!configBuilder.validate()) {
                  shelljs.echo('zcd watch => invalid config');
                  shelljs.echo(`zcd watch => errors:\n${JSON.stringify(configBuilder.errors(), undefined, 2)}\n`);
                  shelljs.exit(1);
                }

                shelljs.echo('zcd watch => valid config');
                shelljs.echo(`zcd watch => config values:\n${configBuilder.toJson()}\n`);

                if (argv['experiments-callback']) {
                  import(resolve(process.cwd(), argv['experiments-callback']))
                    .then(({ default: experimentsCallback }: { default: ExperimentsCallback }) => {
                      void writeConfig(configBuilder.values(), { experimentsCallback, outputFile: argv.outputFile });
                    })
                    .catch((error: unknown) => {
                      if (error instanceof Error) {
                        shelljs.echo(`zcd watch => error message: ${error.message}`);

                        if (error.stack) {
                          shelljs.echo(`zcd watch => error stack:\n${error.stack}\n`);
                        }
                      }
                    });

                  return;
                }

                void writeConfig(configBuilder.values(), { outputFile: argv.outputFile });
              }
            )
            .catch((error: unknown) => {
              if (error instanceof Error) {
                shelljs.echo(`zcd watch => error message: ${error.message}`);

                if (error.stack) {
                  shelljs.echo(`zcd watch => error stack:\n${error.stack}\n`);
                }
              }
            });
        });
      }
    )
    .help().argv;
};
