const t = require('@babel/types');

module.exports = {
  VariableDeclarator: {
    enter(path, state) {
      const id = path.node.id;
      const parent = path.parent;
      const binding = path.scope.getOwnBinding(id.name);

      if (binding == null) {
        return;
      }
      if (!path.get('init').isPure()) {
        return;
      }
      if (binding.referenced) {
        return;
      }

      path.scope.removeOwnBinding(id.name);
      if (t.isVariableDeclaration(parent.node) && parent.node.declarations.length <= 1) {
        parent.remove();
      } else {
        path.remove();
      }
    }
  }
};
