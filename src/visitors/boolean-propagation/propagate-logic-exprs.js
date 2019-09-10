const t = require('@babel/types');

module.exports = {
  LogicalExpression: {
    exit(path, state) {
      const { operator, right } = path.node;
      const { confident, value } = path.get('left').evaluate();

      if (!confident) {
        return;
      }

      const left = t.booleanLiteral(value);

      if (operator === '&&' && value === true) {
        path.replaceWith(right);
      }
      if (operator === '&&' && value === false) {
        path.replaceWith(left);
      }
      if (operator === '||' && value === true) {
        path.replaceWith(left);
      }
      if (operator === '||' && value === false) {
        path.replaceWith(right);
      }
    }
  }
};

