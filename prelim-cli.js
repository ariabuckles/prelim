#!/usr/bin/env node

const path = require('path');
const run = require('@codemod/cli').default;

const cliJs = __filename;
const plugin = path.join(__dirname, 'src', 'plugin.js');
const cliBin = path.join(__dirname, '..', '.bin', 'prelim');

const args = [...process.argv];
const index = args.indexOf(cliJs) + 1 || args.indexOf(cliBin) + 1 || args.length;

args.splice(index, 0, '-p', path.join(__dirname, 'src', 'plugin.js'));

run(args)
  .then(status => {
    process.exit(status);
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(-1);
  });
