const t = require('@babel/types');

/**
 * Turn `!true` into `false` and `!false` into `true`
 *
 * TODO(aria): Use evaluation & isPathPure to do this in more complex cases
 */
module.exports = {
  UnaryExpression: {
    exit(path, state) {
      if (path.node.operator !== '!') {
        return;
      }
      if (!t.isBooleanLiteral(path.node.argument)) {
        return;
      }
      path.replaceWith(t.booleanLiteral(!path.node.argument.value));
    },
  },
};
