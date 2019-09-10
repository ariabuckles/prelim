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
        console.log('removeReferences(test)');
        removeReferences(test, state);
        console.log('removeReferences(alternate)');
        removeReferences(alternate, state);

        replaceWithPossibleBlock(path, consequent);

        test.removed = true;
        alternate.removed = true;

      } else if (path.node.alternate) {
        console.log('removeReferences(test)');
        removeReferences(test, state);
        console.log('removeReferences(consequent)');
        removeReferences(consequent, state);

        replaceWithPossibleBlock(path, alternate);

        test.removed = true;
        consequent.removed = true;

      } else {
        console.log('removeReferences(path)');
        removeReferences(path, state);
        path.remove();
      }
    }
  }
}
