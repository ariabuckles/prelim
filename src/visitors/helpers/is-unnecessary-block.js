const isUnnecessaryBlock = (path, parentPath) => {
  if (!path.isBlockStatement()) {
    return false;
  }
  if (!parentPath.isBlock()) {
    return false;
  }
  if (path.node.directives.length !== 0) {
    return false;
  }
  if (!path.isScope()) {
    return true;
  }

  // Make sure all bindings from this block don't conflict with
  // bindings in the parent scope
  const bindings = path.scope.bindings;
  const parentScope = parentPath.scope;
  return Object.keys(bindings).every((name) => !parentScope.hasBinding(name));
};

module.exports = isUnnecessaryBlock;
