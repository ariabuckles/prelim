const t = require('@babel/types');

const removeReferences = require('./helpers/remove-references');
const replaceWithPossibleBlock = require('./helpers/replace-with-possible-block');

module.exports = {
  Conditional: {
    exit(path, state) {
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

        replaceWithPossibleBlock(path, consequent);

        test.removed = true;
        alternate.removed = true;

      } else if (path.node.alternate) {
        removeReferences(test);
        removeReferences(consequent);

        replaceWithPossibleBlock(path, alternate);

        test.removed = true;
        consequent.removed = true;

      } else {
        removeReferences(path);
        path.remove();
      }
      path.parentPath.requeue();
    }
  }
}
