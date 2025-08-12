#!/usr/bin/env node
// This can be unresolved, depending on whether build has been run.
// eslint-disable-next-line import-x/extensions
const { cli } = await import('zcb/cli');
cli();
