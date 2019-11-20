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
          let value = property.get('value');
          if (!property.node.computed && value.isPure()) {
            if (key.isIdentifier()) {
              propertyNames.add(key.node.name);
            } else if (key.isStringLiteral()) {
              propertyNames.add(key.node.value);
            }
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
          if (property.node.computed) {
            continue;
          }
          let isRemovableIdentifier = key.isIdentifier() && unusedPropertyNames.has(key.node.name);
          let isRemovableString = key.isStringLiteral() && unusedPropertyNames.has(key.node.value);
          if (isRemovableIdentifier || isRemovableString) {
            property.remove();
          }
        }
      }
    }
  }
};
