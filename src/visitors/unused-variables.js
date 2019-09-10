const t = require('@babel/types');

const isRemoved = (path) => {
  while (path != null) {
    path.resync();
    if (path.removed) {
      return true;
    }
    if (t.isProgram(path.node)) {
      return false;
    }
    path = path.parentPath;
  }
  return true;
}

module.exports = {
  Scope: {
    exit(path, state) {
      path.resync();
      const bindings = path.scope.bindings;

      for (const name of Object.keys(bindings)) {
        const binding = bindings[name];

        let referenced = !binding.referencePaths.every(isRemoved);
        if (referenced) {
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
