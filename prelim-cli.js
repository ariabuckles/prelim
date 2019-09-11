#!/usr/bin/env node

const path = require('path');
const run = require('@codemod/cli').default;

const args = [...process.argv];
args.splice(1, 0, '-p', path.join(__dirname, 'src', 'plugin.js'));

run(args)
  .then(status => {
    process.exit(status);
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(-1);
  });
