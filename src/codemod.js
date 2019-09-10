/**
 * jscodeshift codemod wrapper of babel plugin
 */
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;

const plugin = require('./plugin').default;
const pluginInstance = plugin({ types: t });

module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const ast = j(file.source);
  console.log(ast);
  traverse(ast, pluginInstance.visitor);
  return ast.toSource();
};
