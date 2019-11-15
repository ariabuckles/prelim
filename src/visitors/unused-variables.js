const t = require('@babel/types');
const removeDeclaration = require('./helpers/remove-declaration');

/**
 * Remove any unused variables
 */
module.exports = {
  // Go through each of the scopes in the program
  Scope: {
    exit(path, state) {
      // For each scope, find all the variables ("bindings");
      const bindings = path.scope.bindings;

      // For each variable/binding,
      for (const name of Object.keys(bindings)) {
        const binding = bindings[name];

        // If that variable is referenced, leave it and move on
        if (binding.referenced || !binding.constant) {
          continue;
        }

        // If that variable is initialized to an expression with side effects
        // (i.e. a function call), then leave it and move on; it might be important
        if (!binding.path.get('init').isPure()) {
          continue;
        }

        // If we've found a variable that is a parameter to a function,
        // leave it and move on
        if (!binding.path.parentPath.isVariableDeclaration()) {
          continue;
        }

        // Remove the binding's declaration
        removeDeclaration(binding);
      }
    },
  },
};
