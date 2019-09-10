const t = require('@babel/types');

const removeReferences = require('./helpers/remove-references');

const isUnnecessaryBlock = (path, parentPath) => {
  if (!path.isBlockStatement()) {
    return false;
  }
  if (!parentPath.isBlock()) {
    return false;
  }
  if (path.node.directives.length !== 0) {
    return false;
  }
  if (!path.isScope()) {
    return true;
  }
  return Object.keys(path.scope.bindings).length === 0;
};

const replaceWithBlock = (path, replacement) => {
  if (isUnnecessaryBlock(replacement, path.parentPath)) {
    path.replaceWithMultiple(replacement.node.body);
  } else {
    path.replaceWith(replacement.node);
  }
};

module.exports = {
  Conditional: {
    enter(path, state) {
      const test = path.get('test');
      const conditionValue = test.evaluateTruthy();

      if (conditionValue == null) {
        return;
      }

      const alternate = path.get('alternate');
      const consequent = path.get('consequent');

      if (conditionValue) {
        removeReferences(test);
        removeReferences(alternate);

        replaceWithBlock(path, consequent);

        test.removed = true;
        alternate.removed = true;

      } else if (path.node.alternate) {
        removeReferences(test);
        removeReferences(consequent);

        replaceWithBlock(path, alternate);

        test.removed = true;
        consequent.removed = true;

      } else {
        removeReferences(path);
        path.remove();
      }
    }
  }
}
