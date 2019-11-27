const t = require('@babel/types');
const removeReferences = require('../helpers/remove-references');

module.exports = {
  LogicalExpression: {
    exit(path, state) {
      const operator = path.node.operator;
      const left = path.get('left');
      const right = path.get('right');

      const { confident, value } = left.evaluate();
      if (!confident) {
        return;
      }

      removeReferences(left);
      const newLeft = t.booleanLiteral(Boolean(value));

      if (operator === '&&' && value === true) {
        path.replaceWith(right);
      }
      if (operator === '&&' && value === false) {
        removeReferences(right);
        path.replaceWith(newLeft);
      }
      if (operator === '||' && value === true) {
        removeReferences(right);
        path.replaceWith(newLeft);
      }
      if (operator === '||' && value === false) {
        path.replaceWith(right);
      }
    },
  },
};
