const t = require('@babel/types');

module.exports = {
  LogicalExpression: {
    exit(path, state) {
      const { left, operator, right } = path.node;
      if (!t.isBooleanLiteral(left)) {
        return;
      }
      if (operator === '&&' && left.value === true) {
        path.replaceWith(right);
      }
      if (operator === '&&' && left.value === false) {
        path.replaceWith(left);
      }
      if (operator === '||' && left.value === true) {
        path.replaceWith(left);
      }
      if (operator === '||' && left.value === false) {
        path.replaceWith(right);
      }
    }
  }
};

