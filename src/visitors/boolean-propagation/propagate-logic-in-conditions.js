const t = require('@babel/types');

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

      const { left, operator } = path.node;
      const { confident, value } = path.get('right').evaluate();

      if (!confident) {
        return;
      }

      const right = t.booleanLiteral(value);

      if (operator === '&&' && value === true) {
        path.replaceWith(left);
      }
      if (operator === '&&' && value === false) {
        path.replaceWith(right);
      }
      if (operator === '||' && value === true) {
        path.replaceWith(right);
      }
      if (operator === '||' && value === false) {
        path.replaceWith(left);
      }
    }
  }
};

