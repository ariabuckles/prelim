const prettier = require('prettier');
const prettierConfig = require('../../prettier.config.js');
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const serializeAst = {
  test(val) {
    return t.isFile(val) || t.isProgram(val);
  },

  print(ast, serialize, indent) {
    let { code } = generate(ast, { compact: true });
    let formatted = prettier.format(code, {
      ...prettierConfig,
      // lower print-width for inline tests to get better formatting
      printWidth: 60,
    });
    return formatted.trim();
  },
};

module.exports = serializeAst;
