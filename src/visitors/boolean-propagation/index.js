const traverse = require('@babel/traverse');

const PropagateNegation = require('./propagate-negation');
const PropagateLogicExprs = require('./propagate-logic-exprs');
const PropagateLogicInConditions = require('./propagate-logic-in-conditions');

const BooleanPropagation = traverse.visitors.merge([
  PropagateNegation,
  PropagateLogicExprs,
  PropagateLogicInConditions,
]);

module.exports = BooleanPropagation;
