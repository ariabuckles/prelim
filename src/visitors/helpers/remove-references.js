const BindingReferenceRemover = {
  ReferencedIdentifier(path) {
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
      }
    }
  }
};

const BindingReferenceRemoverVisitor = {...BindingReferenceRemover};

const removeReferences = (path) => {
  if (path.isReferencedIdentifier()) {
    BindingReferenceRemover.ReferencedIdentifier(path);
  } else {
    path.traverse(BindingReferenceRemoverVisitor);
  }
};

module.exports = removeReferences;