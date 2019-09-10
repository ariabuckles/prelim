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
      console.log('bindings:', Object.keys(bindings));

      for (const name of Object.keys(bindings)) {
        const binding = bindings[name];

        console.log('Checking for removale of: ' + name);

        //let referenced = !binding.referencePaths.every(isRemoved);
        //console.log('var ' + name + ' is referenced?' + referenced,
        //  "from: " + binding.referencePaths.map(isRemoved));
        if (binding.referenced) {
          console.log('binding was referenced: ', name);
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
