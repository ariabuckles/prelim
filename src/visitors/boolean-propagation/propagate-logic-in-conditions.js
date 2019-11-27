const t = require('@babel/types');
const removeReferences = require('../helpers/remove-references');

/**
 * Is this a logical condition inside an if-statement or ternary
 * operator's test condition, with no non-logical-conditions wrapping
 * it?
 */
const isLogicalExpressionCondition = (path) => {
  while (t.isLogicalExpression(path.node)) {
    if (t.isConditional(path.parent) && path.key === 'test') {
      return true;
    }
    path = path.parentPath;
  }
  return false;
};

module.exports = {
  LogicalExpression: {
    exit(path, state) {
      // This optimization is only safe to do in logical expression
      // chains inside conditional tests:
      if (!isLogicalExpressionCondition(path)) {
        return;
      }

      const operator = path.node.operator;
      const left = path.get('left');
      const right = path.get('right');

      const { confident, value } = right.evaluate();
      if (!confident) {
        return;
      }

      removeReferences(right);
      const newRight = t.booleanLiteral(value);

      if (operator === '&&' && value === true) {
        path.replaceWith(left);
      }
      if (operator === '&&' && value === false) {
        removeReferences(left);
        path.replaceWith(newRight);
      }
      if (operator === '||' && value === true) {
        removeReferences(left);
        path.replaceWith(newRight);
      }
      if (operator === '||' && value === false) {
        path.replaceWith(left);
      }
    },
  },
};
