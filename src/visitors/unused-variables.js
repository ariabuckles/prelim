const t = require('@babel/types');

const isRemoved = (path) => {
  while (path != null) {
    try {
      path.resync();
    } catch (e) {
      console.log(path);
      throw e;
    }
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

      console.log('BINDINGS', Object.keys(bindings));
      for (const name of Object.keys(bindings)) {
        const binding = bindings[name];
        let referenced = false;
        console.log(name, ':', binding.referencePaths.length)
        for (const referencePath of binding.referencePaths) {
          if (!isRemoved(referencePath)) {
            referenced = true;
          }
          console.log('referenced?', referenced);
        }

        console.log('Binding', referenced);
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
