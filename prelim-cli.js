#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const commander = require('commander');
const glob = require('glob-gitignore');
const ignore = require('ignore');
const { transform } = require('@codemod/core');
const packageJson = require('./package.json');
const plugin = require('./src/plugin').default;

const GRAY = '\x1b[2m';
const GREEN = '\x1b[32;1m';
const ORANGE = '\x1b[33m';
const RESET = '\x1b[0m';

const STATUS_INFO = {
  error: {
    icon: '⚠️ ',
    letter: 'X',
    color: ORANGE,
  },
  modified: {
    icon: '✅',
    letter: 'M',
    color: GREEN,
  },
  unchanged: {
    icon: '  ',
    letter: 'U',
    color: GRAY,
  },
};

const program = new commander.Command();

const defaultIgnorePaths = ['.gitignore'];
const addIgnorePath = (item, prev) =>
  item === '' ? [] : prev === defaultIgnorePaths ? [item] : prev.concat([item]);

program
  .name(packageJson.name)
  .arguments('[--] <filesOrPatterns...>')
  .option(
    '--strict',
    'turn on strict mode and disable probably-safe optimizations (default: loose mode)',
  )
  .option(
    '--ignore-path <file>',
    'Path to a file with patterns describing files to ignore (repeatable)',
    addIgnorePath,
    defaultIgnorePaths
  )
  .option(
    '--source-type <script|module>',
    'parse as a JS script, an ES module, or specify "unambiguous" to let babel determine',
    'unambiguous'
  )
  .option(
    '--printer <recast|prettier|babel>',
    'which code printer to use',
    'recast'
  )
  .option(
    '--colors <auto|always|off>',
    'whether to display colours. "auto" defaults to true of running in a TTY.',
    'auto'
  )
  .version(
    packageJson.version,
    '-v, --version',
    'output the current prelim version'
  )
  .on('--help', () => console.log() /* print a newline after help */);

program.parse(process.argv);

if (program.args.length === 0) {
  program.outputHelp();
  process.exit(1);
}

let rawFiles = [];
let patterns = [];
for (let fileOrPattern of program.args) {
  try {
    let stats = fs.statSync(fileOrPattern);
    if (stats.isFile()) {
      rawFiles.push(fileOrPattern);
    } else if (stats.isDirectory()) {
      patterns.push(`${fileOrPattern}/**/*.{js,mjs,cjs,jsx,ts,tsx}`);
    } else {
      patterns.push(fileOrPattern);
    }
  } catch (e) {
    // we expect an ENOENT, which means it was not a file
    if (e.code === 'ENOENT') {
      patterns.push(fileOrPattern);
    } else {
      throw e;
    }
  }
}

let ignores = ignore().add(
  program.ignorePath.map((file) => {
    try {
      return fs.readFileSync(file, 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') {
        return '';
      } else {
        throw e;
      }
    }
  })
);

let files = rawFiles.concat(
  patterns.length === 0
    ? []
    : glob.sync(patterns, {
        ignore: ignores,
      })
);

if (files.length === 0) {
  console.log('No matching files found.');
  process.exit(0);
}

const useColors =
  program.colors === 'auto'
    ? process.stdout.isTTY
    : program.colors === 'always';

const printStatus = (statusCode) => {
  let symbol = useColors
    ? STATUS_INFO[statusCode].icon
    : STATUS_INFO[statusCode].letter;

  process.stdout.write(symbol + ' ');
  if (useColors && process.stdout.isTTY) {
    readline.cursorTo(process.stdout, 3);
  }
};

const colorByStatus = (statusCode) => {
  if (useColors) {
    process.stdout.write(STATUS_INFO[statusCode].color);
  }
};

for (let file of files) {
  if (useColors && process.stdout.isTTY) {
    process.stdout.write('   ' + file);
    readline.cursorTo(process.stdout, 0);
  }

  let status = 'unchanged';
  let error = null;
  try {
    let code = fs.readFileSync(file, 'utf8');
    let { code: result } = transform(code, {
      plugins: [[plugin, { loose: !program.strict }]],
      printer: program.printer,
      sourceType: program.sourceType,
      babelrc: false,
      configFile: false,
    });
    if (result !== code) {
      status = 'modified';
      fs.writeFileSync(file, result, 'utf8');
    }
  } catch (e) {
    status = 'error';
    error = e;
  }

  if (useColors && process.stdout.isTTY) {
    readline.clearLine(process.stdout, 0);
  }

  printStatus(status);
  colorByStatus(status);
  process.stdout.write(file);

  if (useColors) {
    process.stdout.write(RESET);
  }
  process.stdout.write('\n');
  if (error) {
    console.error(error);
  }
}
