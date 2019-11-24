const prettier = require('prettier');
const prettierConfig = require('../../prettier.config.js');
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const serializeAst = {
  test(val) {
    return t.isFile(val) || t.isProgram(val);
  },

  print(ast, serialize, indent) {
    let { code } = generate(ast);
    let formatted = prettier.format(code, prettierConfig);
    return formatted.trim();
  },
};

module.exports = serializeAst;
