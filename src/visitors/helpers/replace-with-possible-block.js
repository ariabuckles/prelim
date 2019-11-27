const isUnnecessaryBlock = require('./is-unnecessary-block');

const replaceWithPossibleBlock = (path, replacement) => {
  if (isUnnecessaryBlock(replacement, path.parentPath)) {
    // Move any variables back to the parent scope:
    if (replacement.isScope()) {
      for (const name of Object.keys(replacement.scope.bindings)) {
        replacement.scope.moveBindingTo(name, path.scope);
      }
    }

    path.replaceWithMultiple(replacement.node.body);
  } else {
    path.replaceWith(replacement.node);
  }
};

module.exports = replaceWithPossibleBlock;
