#!/usr/bin/env node
const { cli } = await import('../dist/esm/cli.mjs'); // eslint-disable-line import/no-unresolved
cli();
