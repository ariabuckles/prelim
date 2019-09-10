const t = require('@babel/types');

module.exports = {
  VariableDeclarator: {
    enter(path, state) {
      const id = path.node.id;
      const binding = path.scope.getOwnBinding(id.name);
      const parent = path.parent;
      if (binding == null) {
        return;
      }
      if (!binding.referenced) {
        path.scope.removeOwnBinding(id.name);
        if (t.isVariableDeclaration(parent.node) && parent.node.declarations.length <= 1) {
          parent.remove();
        } else {
          path.remove();
        }
      }
    }
  }
};
