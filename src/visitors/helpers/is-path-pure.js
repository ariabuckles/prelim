const t = require('@babel/types');
const { Scope } = require('@babel/traverse');

/**
 * Wrapper around Babel's isPure to support a loose mode that treats
 * object accesses as pure (which is the case except for getters/proxies,
 * which in idiomatic code shouldn't be impure themselves).
 */

function isProbablyPure(node, constantsOnly) {
  if (t.isMemberExpression(node)) {
    // Hook into MemberExpression checks:
    return (
      this.isPure(node.object, constantsOnly) &&
      (!node.computed || this.isPure(node.property, constantsOnly))
    );
  } else {
    // Use default babel scope logic otherwise:
    return Scope.prototype.isPure.call(this, node, constantsOnly);
  }
}

const isPathPure = (path, state) => {
  let scope = path.scope;
  let isLooseMode = state.opts.loose || false;

  if (!isLooseMode) {
    return scope.isPure(path.node, false);
  } else {
    let proxy = new Proxy(scope, {
      get: (target, property) => property === 'isPure' ? isProbablyPure : target[property],
    });
    return proxy.isPure(path.node, false);
  }
}

module.exports = isPathPure;
