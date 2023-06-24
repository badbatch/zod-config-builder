import { resolve } from 'node:path';
import shelljs from 'shelljs';
import type { Commands } from '../cli.ts';
import type { SetupExperimentsCallback } from '../types.ts';
import { transformWriteConfig } from './transformWriteConfig.ts';

export const importValidateTransformWriteConfig = (
  inputFile: string,
  outputFile: string,
  command: Commands,
  experimentCallbackFile?: string
) => {
  import(resolve(process.cwd(), inputFile))
    .then(
      ({
        default: configBuilder,
      }: {
        default: ReturnType<typeof import('../createConfigBuilder.ts')['createConfigBuilder']>;
      }) => {
        if (!configBuilder.validate()) {
          shelljs.echo(`zcd ${command} => invalid config`);
          shelljs.echo(`zcd ${command} => config values:\n${configBuilder.toJson()}\n`);
          shelljs.echo(`zcd ${command} => errors:\n${JSON.stringify(configBuilder.errors(), undefined, 2)}\n`);
          shelljs.exit(1);
        }

        shelljs.echo('zcd ${command} => valid config');
        shelljs.echo(`zcd ${command} => config values:\n${configBuilder.toJson()}\n`);

        if (experimentCallbackFile) {
          import(resolve(process.cwd(), experimentCallbackFile))
            .then(({ default: experimentsCallback }: { default: SetupExperimentsCallback }) => {
              void transformWriteConfig(configBuilder.values(), { experimentsCallback, outputFile });
            })
            .catch((error: unknown) => {
              if (error instanceof Error) {
                shelljs.echo(`zcd ${command} => error message: ${error.message}`);

                if (error.stack) {
                  shelljs.echo(`zcd ${command} => error stack:\n${error.stack}\n`);
                }
              }
            });

          return;
        }

        void transformWriteConfig(configBuilder.values(), { outputFile });
      }
    )
    .catch((error: unknown) => {
      if (error instanceof Error) {
        shelljs.echo(`zcd ${command} => error message: ${error.message}`);

        if (error.stack) {
          shelljs.echo(`zcd ${command} => error stack:\n${error.stack}\n`);
        }
      }
    });
};
