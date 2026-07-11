import { resolve } from 'node:path';
import shelljs from 'shelljs';
import { type CliCommands } from '../cli.ts';
import { type ConfigBuilder } from '../createConfigBuilder.ts';
import { type SetupExperimentsCallback } from '../types.ts';
import { transformWriteConfig } from './transformWriteConfig.ts';

export const importValidateTransformWriteConfig = (
  inputFile: string,
  outputFile: string,
  command: CliCommands,
  experimentCallbackFile?: string,
): void => {
  import(resolve(process.cwd(), inputFile))
    // TODO: Will revisit
    // eslint-disable-next-line unicorn/prefer-await
    .then(({ default: configBuilder }: { default: ConfigBuilder<object> }) => {
      if (!configBuilder.$validate()) {
        shelljs.echo(`zcd ${command} => invalid config`);
        shelljs.echo(`zcd ${command} => config values:\n${configBuilder.$toJson()}\n`);
        shelljs.echo(`zcd ${command} => errors:\n${JSON.stringify(configBuilder.$errors(), undefined, 2)}\n`);
        shelljs.exit(1);
      }

      shelljs.echo('zcd ${command} => valid config');
      shelljs.echo(`zcd ${command} => config values:\n${configBuilder.$toJson()}\n`);

      if (experimentCallbackFile) {
        import(resolve(process.cwd(), experimentCallbackFile))
          // TODO: Will revisit
          // eslint-disable-next-line unicorn/prefer-await
          .then(({ default: experimentsCallback }: { default: SetupExperimentsCallback }) => {
            void transformWriteConfig(configBuilder.$values(), { experimentsCallback, outputFile });
          })
          // TODO: Will revisit
          // eslint-disable-next-line unicorn/prefer-await
          .catch((error: unknown) => {
            if (!(error instanceof Error)) {
              return;
            }

            shelljs.echo(`zcd ${command} => error message: ${error.message}`);

            if (error.stack) {
              shelljs.echo(`zcd ${command} => error stack:\n${error.stack}\n`);
            }
          });

        return;
      }

      void transformWriteConfig(configBuilder.$values(), { outputFile });
    })
    // TODO: Will revisit
    // eslint-disable-next-line unicorn/prefer-await
    .catch((error: unknown) => {
      if (!(error instanceof Error)) {
        return;
      }

      shelljs.echo(`zcd ${command} => error message: ${error.message}`);

      if (error.stack) {
        shelljs.echo(`zcd ${command} => error stack:\n${error.stack}\n`);
      }
    });
};
