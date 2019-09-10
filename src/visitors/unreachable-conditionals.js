const t = require('@babel/types');

const removeReferences = require('./helpers/remove-references');

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

        path.replaceWith(path.node.consequent);

        test.removed = true;
        alternate.removed = true;

      } else if (path.node.alternate) {
        removeReferences(test);
        removeReferences(consequent);

        path.replaceWith(path.node.alternate);

        test.removed = true;
        consequent.removed = true;

      } else {
        removeReferences(path);
        path.remove();
      }
    }
  }
}
