const traverse = require('@babel/traverse');

const PropagateNegation = require('./propagate-negation');
const PropagateLogicExprs = require('./propagate-logic-exprs');

const BooleanPropagation = traverse.visitors.merge([
  PropagateNegation,
  PropagateLogicExprs,
]);

module.exports = BooleanPropagation;
