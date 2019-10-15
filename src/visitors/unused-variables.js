const t = require('@babel/types');
const removeDeclaration = require('./helpers/remove-declaration');

module.exports = {
  Scope: {
    exit(path, state) {
      const bindings = path.scope.bindings;

      for (const name of Object.keys(bindings)) {
        const binding = bindings[name];

        if (binding.referenced || !binding.constant) {
          continue;
        }
        if (!binding.path.get('init').isPure()) {
          continue;
        }
        if (!binding.path.parentPath.isVariableDeclaration()) {
          continue;
        }

        const parent = binding.path.parent;
        const id = binding.path.get('id');

        removeDeclaration(binding);

//        if (binding.path.isVariableDeclarator() && id.isObjectPattern()) {
//          console.log('id:', id.node);
//        }
//
//        path.scope.removeOwnBinding(name);
//        if (parent.isVariableDeclaration() && parent.node.declarations.length <= 1) {
//          console.log('isVariableDeclaration')
//          parent.remove();
//        } else {
//          console.log('removing biding only', binding.path.node)
//          binding.path.remove();
//        }
      }
    }
  }
};
