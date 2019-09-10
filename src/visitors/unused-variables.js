const t = require('@babel/types');

module.exports = {
  Scope: {
    exit(path, state) {
      const bindings = path.scope.bindings;

      for (const name of Object.keys(bindings)) {
        const binding = bindings[name];

        if (binding.referenced) {
          continue;
        }
        if (!binding.path.get('init').isPure()) {
          continue;
        }

        const parent = binding.path.parent;

        path.scope.removeOwnBinding(name);
        if (t.isVariableDeclaration(parent.node) && parent.node.declarations.length <= 1) {
          parent.remove();
        } else {
          binding.path.remove();
        }
      }
    }
  }
};
