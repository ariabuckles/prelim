const t = require('@babel/types');

module.exports = {
  BlockStatement: {
    exit(path, state) {
      path.resync();
      if (!t.isBlock(path.parent)) {
        return;
      }
      if (path.node.directives.length !== 0) {
        return;
      }
      if (!path.isScope() || Object.keys(path.scope.bindings).length !== 0) {
        path.replaceWithMultiple(path.node.body);
      }
    }
  }
};
