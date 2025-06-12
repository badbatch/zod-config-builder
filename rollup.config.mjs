import rollupConfig from '@repodog/rollup-config';
import swcConfig from '@repodog/swc-config';
import swcPlugin from '@rollup/plugin-swc';

const config = rollupConfig({ compiler: swcPlugin({ swc: swcConfig.ts }) });

// rollup requires a default export
// eslint-disable-next-line import-x/no-default-export
export default [
  {
    ...rollupConfig({
      compiler: swcPlugin({ swc: swcConfig.ts }),
      copy: {
        targets: [{ dest: ['dist/esm/templates', 'dist/cjs/templates'], src: 'src/templates/*' }],
      },
    }),
  },
  {
    ...rollupConfig({ compiler: swcPlugin({ swc: swcConfig.ts }) }),
    input: config.input.replace('index', 'cli'),
    output: {
      ...config.output,
      file: config.output.file.replace('index', 'cli'),
    },
  },
];
