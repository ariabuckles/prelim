const t = require('@babel/types');

/**
 * Find unused properties on objects and remove them
 */
module.exports = {
  // Go through each of the scopes in the program
  Scope: {
    // path is a Babel NodePath: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#paths
    exit(path) {
      // For each scope, find all the variables ("bindings");
      const bindings = path.scope.bindings;

      // For each variable/binding,
      for (const name of Object.keys(bindings)) {
        const binding = bindings[name];
        console.log('Found variable:', name);

        console.log(`Variable '${name}' is used in the following places:`);
        for (let reference of binding.referencePaths) {
          console.log(reference);
          console.log('isIdentifier', reference.isIdentifier());
          console.log('isMemberExpression', reference.parentPath.isMemberExpression());
        }
      }
    }
  }
};
