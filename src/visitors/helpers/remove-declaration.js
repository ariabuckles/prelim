const t = require('@babel/types');

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

const removeDeclaration = (binding) => {
  const identifierName = binding.identifier.name;
  const scope = binding.scope;
  const path = binding.path;

  scope.removeOwnBinding(identifierName);

  removeDeclarator(path, identifierName);

  if (path.parent.declarations.length === 0) {
    path.parentPath.remove();
  }
};

module.exports = removeDeclaration;
