const IdentifierRemover = {
  Identifier(path, state) {
    if (path.node !== state.identifier) {
      return;
    }

    path.remove();
  }
};

const removeDeclaration = (binding) => {
  const name = binding.identifier.name;
  const scope = binding.scope;
  scope.removeOwnBinding(name);

  console.log(binding.identifier);
  binding.identifier.remove();

  binding.path.traverse(IdentifierRemover, {
    identifier: binding.identifier,
  });
};

module.exports = removeDeclaration;
