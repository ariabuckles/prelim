const BindingReferenceRemover = {
  ReferencedIdentifier(path) {
    console.log('Removing reference: ', path.node.name);
    let binding = path.scope.getBinding(path.node.name);
    if (binding == null) {
      console.log('no binding found; bailing');
      return;
    }
    //console.log('references:', binding.referencePaths.map(p => p.parent));
    // TODO(aria): Does this === work?
    const thisReferenceIndex = binding.referencePaths.indexOf(path);
    console.log('found ref?', thisReferenceIndex);
    if (thisReferenceIndex >= 0) {
      binding.referencePaths.splice(thisReferenceIndex, 1);
      if (binding.referencePaths.length === 0) {
        binding.referenced = false;
        console.log('all refs removed', binding.referenced);
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
