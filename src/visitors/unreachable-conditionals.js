const t = require('@babel/types');

module.exports = {
  Conditional: {
    enter(path, state) {
      const conditionValue = path.get('test').evaluateTruthy();

      console.log('Conditional of', conditionValue);

      if (conditionValue == null) {
        return;
      }

      if (conditionValue) {
        path.replaceWith(path.node.consequent);
      } else if (path.node.alternate) {
        path.replaceWith(path.node.alternate);
      } else {
        path.remove();
      }
    }
  }
}
