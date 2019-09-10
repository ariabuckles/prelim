const t = require('@babel/types');
const traverse = require('@babel/traverse');

const BooleanPropagation = require('./boolean-propagation');
const UnusedVariables = require('./unused-variables');

const CoreVisitor = traverse.visitors.merge([
  BooleanPropagation,
  UnusedVariables
]);

console.log('CoreVisitor', CoreVisitor, BooleanPropagation);

module.exports = CoreVisitor;
