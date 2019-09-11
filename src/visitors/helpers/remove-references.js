const BindingReferenceRemover = {
  Identifier(path) {
    let binding = path.scope.getBinding(path.node.name);
    if (binding == null) {
      return;
    }
    // NOTE: The === comparison on paths here seems to work ok?
    const thisReferenceIndex = binding.referencePaths.indexOf(path);
    if (thisReferenceIndex >= 0) {
      binding.referencePaths.splice(thisReferenceIndex, 1);
      if (binding.referencePaths.length === 0) {
        binding.referenced = false;
        binding.path.requeue();
      }
    }
  }
};

const BindingReferenceRemoverVisitor = {...BindingReferenceRemover};

const removeReferences = (path, state) => {
  if (path.removed) {
    return;
  }
  if (path.isReferencedIdentifier()) {
    BindingReferenceRemover.Identifier(path, state);
  } else {
    path.traverse(BindingReferenceRemoverVisitor, state);
  }
};

module.exports = removeReferences;
