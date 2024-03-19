const rollupConfig = require('@repodog/rollup-config');
const swcConfig = require('@repodog/swc-config');
const swcPlugin = require('@rollup/plugin-swc');

const config = rollupConfig({ compiler: swcPlugin({ swc: swcConfig.ts }) });

module.exports = [
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
