const buildConfig = require('@repodog/rollup-config');

const config = buildConfig();

module.exports = [
  {
    ...buildConfig({
      copy: {
        targets: [{ dest: ['dist/esm/templates', 'dist/cjs/templates'], src: 'src/templates/*' }],
      },
    }),
  },
  {
    ...config,
    input: config.input.replace('index', 'cli'),
    output: {
      ...config.output,
      file: config.output.file.replace('index', 'cli'),
    },
  },
];
