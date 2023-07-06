#!/usr/bin/env node
const { cli } = await import('../dist/main/cli.mjs'); // eslint-disable-line import/no-unresolved
cli();
