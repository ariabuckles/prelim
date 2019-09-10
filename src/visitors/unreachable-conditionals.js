const t = require('@babel/types');

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
        path.replaceWith(path.node.consequent);
        //test.remove();
        //consequent.remove();
        test.removed = true;
        alternate.removed = true;
      } else if (path.node.alternate) {
        path.replaceWith(path.node.alternate);
        //test.remove();
        //consequent.remove();
        test.removed = true;
        consequent.removed = true;
      } else {
        path.remove();
      }
      //console.log('REMOVED CONDITIONAL', test);
    }
  }
}
