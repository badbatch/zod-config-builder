const buildConfig = require('@repodog/rollup-config');

const config = buildConfig();

module.exports = [
  {
    ...buildConfig({
      copy: {
        targets: [{ dest: 'dist/main/templates', src: 'src/templates/*' }],
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
