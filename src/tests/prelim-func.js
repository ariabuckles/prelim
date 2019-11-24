const { transformFromAstSync } = require('@babel/core');
const { parseExpression } = require('@babel/parser');
const t = require('@babel/types');
const plugin = require('../plugin').default;

const unwrapBody = (body) => {
  if (Array.isArray(body)) {
    return body;
  } else if (t.isBlockStatement(body)) {
    return body.body;
  } else {
    return [body];
  }
};

const prelimFunc = (options, inputFunc) => {
  if (typeof options === 'function') {
    inputFunc = options;
    options = { loose: true };
  }
  let funcAst = parseExpression(String(inputFunc));
  let program = t.program(unwrapBody(funcAst.body));
  let { ast } = transformFromAstSync(program, null, {
    ast: true,
    code: false,
    plugins: [[plugin, options]],
  });
  return ast;
};

module.exports = prelimFunc;
