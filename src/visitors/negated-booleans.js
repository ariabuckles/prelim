
module.exports = (t) => {
  return {
    UnaryExpression(path, state) {
      if (path.node.operator !== '!') {
        return;
      }
      if (!t.isBooleanLiteral(path.node.argument)) {
        return;
      }
      path.replaceWith(t.booleanLiteral(!path.node.argument.value));
    }
  }
};
