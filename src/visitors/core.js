const t = require('@babel/types');
const traverse = require('@babel/traverse');

const BooleanPropagation = require('./boolean-propagation');
const UnusedVariables = require('./unused-variables');
const UnreachableConditionals = require('./unreachable-conditionals');
const UnusedProperties = require('./unused-properties');

const CoreVisitor = traverse.visitors.merge([
  BooleanPropagation,
  UnusedVariables,
  UnreachableConditionals,
  UnusedProperties,
]);

module.exports = CoreVisitor;
