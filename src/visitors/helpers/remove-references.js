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
      binding.dereference();
      if (!binding.referenced && binding.constant) {
        binding.path.requeue();
      }
    }
  },

  BindingIdentifier(path) {
    let binding = path.scope.getBinding(path.node.name);
    if (binding == null) {
      return;
    }

    const thisAssignmentIndex = binding.constantViolations.indexOf(path);
    if (thisAssignmentIndex >= 0) {
      binding.constantViolations.splice(thisAssignmentIndex, 1);
      binding.constant = binding.constantViolations.length === 0;
      if (binding.constant && !binding.referenced) {
        binding.path.requeue();
      }
    }
  },
};

const BindingReferenceRemoverVisitor = { ...BindingReferenceRemover };

const removeReferences = (path, state) => {
  if (path.removed) {
    return;
  }
  if (path.isReferencedIdentifier()) {
    BindingReferenceRemover.ReferencedIdentifier(path, state);
  } else if (path.isBindingIdentifier()) {
    BindingReferenceRemover.BindingIdentifier(path, state);
  } else {
    path.traverse(BindingReferenceRemoverVisitor, state);
  }
};

module.exports = removeReferences;
