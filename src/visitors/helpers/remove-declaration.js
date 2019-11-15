const t = require('@babel/types');

/**
 * Remove the VariableDeclarator, or part of the VariableDeclarator,
 * for this identifier
 */
const removeDeclarator = (declaratorPath, identifierName) => {
  const left = declaratorPath.get('id');
  const right = declaratorPath.get('init');

  if (left.isObjectPattern()) {
    let property = left.get('properties').find(
      (prop) => prop.node.value.name === identifierName
    );

    if (right.isObjectExpression()) {
      let initProperty = right.get('properties').find(
        (prop) => prop.node.key.name === property.node.key.name
      );
      if (initProperty) {
        initProperty.remove();
      }
    }

    property.remove();

    if (declaratorPath.node.id.properties.length === 0) {
      declaratorPath.remove();
    }
  } else {
    declaratorPath.remove();
  }
};

/**
 * Remove the variable declaration referred to by the given variable binding
 */
const removeDeclaration = (binding) => {
  const identifierName = binding.identifier.name;
  const scope = binding.scope;
  const path = binding.path;

  // Remove the variable binding from the scope
  scope.removeOwnBinding(identifierName);

  // Remove the VariableDeclarator, or part of the VariableDeclarator,
  // for this identifier
  removeDeclarator(path, identifierName);

  // If that removed all of the declarations in the VariableDeclaration,
  // then we should remove the whole VariableDeclaration
  if (path.parent.declarations.length === 0) {
    path.parentPath.remove();
  }
};

module.exports = removeDeclaration;
