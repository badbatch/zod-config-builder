#!/usr/bin/env -S node --loader ts-node/esm
const { cli } = await import('../dist/main/cli.mjs'); // eslint-disable-line import/no-unresolved
cli();
