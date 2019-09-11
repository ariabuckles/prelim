const BindingReferenceRemover = {
  Identifier(path) {
    console.log('Found ref', path.node.name);
    let binding = path.scope.getBinding(path.node.name);
    if (binding == null) {
      console.log('no binding; bailing');
      return;
    }
    // NOTE: The === comparison on paths here seems to work ok?
    const thisReferenceIndex = binding.referencePaths.indexOf(path);
    if (thisReferenceIndex >= 0) {
      console.log('removing ref to', path.node.name);
      binding.referencePaths.splice(thisReferenceIndex, 1);
      if (binding.referencePaths.length === 0) {
        binding.referenced = false;
        console.log('requeueing: ', binding.path.node.name);
        binding.path.requeue();
      }
    }
  }
};

const BindingReferenceRemoverVisitor = {...BindingReferenceRemover};

const removeReferences = (path, state) => {
  console.log('removing references from ', path.node.type);
  if (path.isReferencedIdentifier()) {
    BindingReferenceRemover.Identifier(path, state);
  } else {
    path.traverse(BindingReferenceRemoverVisitor, state);
    if (path.node.test) {
      removeReferences(path.get('test'), state);
    }
  }
};

module.exports = removeReferences;
