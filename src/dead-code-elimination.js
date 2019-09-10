/**
 * Dead code elimination?
 *
 */

module.exports = function(file, api) {
    const j = api.jscodeshift;
    const ast = j(file.source);

    // Filter from jscodeshift's VariableDeclarator renameTo:
    const isVariableIdentifier = function(path) {
      const types = api.jscodeshift;
      const parent = path.parent.node;

      if (
        types.MemberExpression.check(parent) &&
        parent.property === path.node &&
        !parent.computed
      ) {
        // obj.oldName
        return false;
      }

      if (
        types.Property.check(parent) &&
        parent.key === path.node &&
        !parent.computed
      ) {
        // { oldName: 3 }
        return false;
      }

      if (
        types.MethodDefinition.check(parent) &&
        parent.key === path.node &&
        !parent.computed
      ) {
        // class A { oldName() {} }
        return false;
      }

      if (
        types.ClassProperty.check(parent) &&
        parent.key === path.node &&
        !parent.computed
      ) {
        // class A { oldName = 3 }
        return false;
      }

      if (
        types.JSXAttribute.check(parent) &&
        parent.name === path.node &&
        !parent.computed
      ) {
        // <Foo oldName={oldName} />
        return false;
      }

      return true;
    };

    const isBooleanLiteral = (node) => {
        if (node == null) {
            return false;
        }
        return node.type === 'BooleanLiteral' ||
            (node.type === 'Literal' && node.value === !!node.value);
    };
    const isBooleanExpr = (node) => {
        if (node == null) {
            return false;
        }
        return isBooleanLiteral(node) ||
            node.type === 'LogicalExpression' ||
            node.type === 'BinaryExpression' && ['==', '===', '!=', '!==', '>', '<', '>=', '<=', '&&', '||'].includes(node.operator);
    };
    const isTrue = (node) => isBooleanLiteral(node) && node.value === true;
    const isFalse = (node) => isBooleanLiteral(node) && node.value === false;

    const cleanBlock = (block, parent) => {
        if (block == null) {
            return null;
        }

        if (block.type !== 'BlockStatement') {
            // It was just a statement...
            return block;
        }

        if (parent == null || parent.type !== 'BlockStatement') {
            // can't remove block statements outside of parent blocks
            return block;
        }

        if (block.directives.length > 0) {
            // can't remove 'use strict' blocks (well... debatably we can now?)
            return block;
        }

        if (block.body.some((node) => node.type === 'VariableDeclaration' && node.kind !== 'var')) {
            // can't remove blocks with `let` or `const` scoped variable declarations
            return block;
        }

        return block.body;
    }

    let notsRemoved = 0;
    let orsRemoved = 0;
    let andsRemoved = 0;
    let varsRemoved = 0;

    do {
        // Evaluate any `!true`s or `!false`s
        do {
            notsRemoved = ast.find(j.UnaryExpression, { operator: '!' })
                .filter((p) => isBooleanLiteral(p.node.argument))
                .replaceWith((p) => j.booleanLiteral(!p.node.argument.value))
                .size();
        } while (notsRemoved > 0);

        do {
            // Remove any `|| true`s or `&& false`s
            orsRemoved = ast.find(j.LogicalExpression)
                .filter((p) => p.node.operator === '||')
                .filter((p) => isTrue(p.node.left) || isTrue(p.node.right) && isBooleanExpr(p.node.left))
                .replaceWith(j.booleanLiteral(true))
                .size();

            andsRemoved = ast.find(j.LogicalExpression)
                .filter((p) => p.node.operator === '&&')
                .filter((p) => isFalse(p.node.left) || isFalse(p.node.right) && isBooleanExpr(p.node.left))
                .replaceWith(j.booleanLiteral(false))
                .size();

            // Remove `true &&`s and `false ||`s:
            orsRemoved += ast.find(j.LogicalExpression)
                .filter((p) => p.node.operator === '||')
                .filter((p) => isFalse(p.node.left))
                .replaceWith((p) => p.node.right)
                .size();

            andsRemoved += ast.find(j.LogicalExpression)
                .filter((p) => p.node.operator === '&&')
                .filter((p) => isTrue(p.node.left))
                .replaceWith((p) => p.node.right)
                .size();
        } while (orsRemoved > 0 || andsRemoved > 0);

        // Remove any `&& true`s or `|| false`s in if statements
        do {
            orsRemoved = ast.find(j.IfStatement)
                .map((p) => p.get('test'))
                .find(j.LogicalExpression)
                .filter((p) => p.node.operator === '||')
                .filter((p) => isFalse(p.node.right))
                .replaceWith((p) => p.node.left)
                .size();

            andsRemoved = ast.find(j.IfStatement)
                .map((p) => p.get('test'))
                .find(j.LogicalExpression)
                .filter((p) => p.node.operator === '&&')
                .filter((p) => isTrue(p.node.right))
                .replaceWith((p) => p.node.left)
                .size();
        } while (orsRemoved > 0 || andsRemoved > 0);

        // Remove any boolean literal variables that aren't in CONSTANT_CASE
        var trues = ast.find(j.VariableDeclarator)
            .filter((p) => isTrue(p.node.init) && p.parent.node.kind === 'const' && /[a-z]/.test(p.node.id.name));
        if (trues.size()) {
            trues
                .renameTo('true')
                .map(p => p.parent.node.declarations.length <= 1 ? p.parent : p)
                .remove()
        }

        var falses = ast.find(j.VariableDeclarator)
            .filter((p) => isFalse(p.node.init) && p.parent.node.kind === 'const' && /[a-z]/.test(p.node.id.name));
        if (falses.size()) {
            falses
                .renameTo('false')
                .map(p => p.parent.node.declarations.length <= 1 ? p.parent : p)
                .remove()
        }

        varsRemoved = ast.find(j.Identifier)
            .filter(isVariableIdentifier)
            .filter((p) => p.node.name === 'true' || p.node.name === 'false')
            .replaceWith((p) => j.booleanLiteral(JSON.parse(p.node.name)))
            .size();

    } while (varsRemoved > 0);

    ast.find(j.IfStatement)
        .filter((p) => isBooleanLiteral(p.node.test))
        .replaceWith((p) => {
            return cleanBlock(
                (p.node.test.value ? p.node.consequent : p.node.alternate),
                p.parent.node
            );
        })

    ast.find(j.ConditionalExpression)
        .filter((p) => isBooleanLiteral(p.node.test))
        .replaceWith((p) => p.node.test.value ? p.node.consequent : p.node.alternate);

    ast.find(j.VariableDeclarator)
        .filter((p) => p.node.id.type === 'Identifier')
        .filter((p) => {
            // Leave variables if there's a function call in their declaration;
            // the call might have side effects and the var might be there
            // for convenient naming only.
            if (j(p).find(j.CallExpression).size() !== 0) {
                return false;
            }
            return j(p).closestScope()
                .find(j.Identifier, { name: p.node.id.name })
                .filter(isVariableIdentifier)
                .filter((path) =>
                    // Find references that are either the left or
                    // right of the var decl
                    // If left, we remove them
                    path.parent.node.type !== 'VariableDeclarator'
                )
                .size() === 0
        })
        .forEach(p => {
            j(p).closestScope()
                .find(j.Identifier, { name: p.node.id.name })
                .filter(isVariableIdentifier)
                // Only take rhs of var decls:
                .filter((path) => path.name === 'init')
                .replaceWith(p.node.init);
        })
        .map(p => p.parent.node.declarations.length <= 1 ? p.parent : p)
        .remove();

    return ast.toSource();
};
