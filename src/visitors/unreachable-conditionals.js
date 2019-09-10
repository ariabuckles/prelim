const t = require('@babel/types');

const removeReferences = require('./helpers/remove');

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
      let removedIdentifiers;
      if (conditionValue) {
        removeReferences(test);
        removeReferences(alternate);
        path.replaceWith(path.node.consequent);
        //test.removed = true;
        //alternate.removed = true;
        //removedIdentifiers = Object.assign(test.getBindingIdentifiers(), alternate.getBindingIdentifiers());
      } else if (path.node.alternate) {
        console.log('REMOVING TEST REFS');
        removeReferences(test);
        console.log('REMOVING CONSEQUENT REFS');
        removeReferences(consequent);
        path.replaceWith(path.node.alternate);
        //test.removed = true;
        //consequent.removed = true;
        //removedIdentifiers = Object.assign(test.getBindingIdentifiers(), consequent.getBindingIdentifiers());
      } else {
        //removedIdentifiers = path.getBindingIdentifiers();
        //path.remove();
        //path.removed = true;
        removeReferences(path);
        path.remove();
      }
      //console.log('REMOVED CONDITIONAL with decls for', removedIdentifiers);
    }
  }
}
