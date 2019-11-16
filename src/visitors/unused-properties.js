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

        const declarator = binding.path;
        const object = declarator.get('init');

        if (!object.isObjectExpression()) {
          continue;
        }

        if (!binding.constant) {
          continue;
        }

        let propertyNames = new Set();
        for (let property of object.get('properties')) {
          let key = property.get('key');
          if (key.isIdentifier() && !property.node.computed) {
            propertyNames.add(key.node.name);
          }
        }

        // Check that all usages are dot notation property access
        let areAllUsagesDotProperties = binding.referencePaths.every(
          (ref) => ref.parentPath.isMemberExpression() && !ref.parentPath.node.computed
        );

        if (!areAllUsagesDotProperties) {
          continue;
        }

        let usedPropertyNames = new Set();
        for (let reference of binding.referencePaths) {
          let usage = reference.parentPath;
          let key = usage.get('property');

          if (!key.isIdentifier()) {
            throw new Error("Internal error: expected property key was not an identifier");
          }
          usedPropertyNames.add(key.node.name);
        }


        // Set difference
        let unusedPropertyNames = new Set([...propertyNames].filter(p => !usedPropertyNames.has(p)));

        for (let property of object.get('properties')) {
          let key = property.get('key');
          if (key.isIdentifier() && !key.node.computed) {
            let propertyName = key.node.name;
            if (unusedPropertyNames.has(propertyName)) {
              property.remove();
            }
          }
        }
      }
    }
  }
};
