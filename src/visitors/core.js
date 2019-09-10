const t = require('@babel/types');
const traverse = require('@babel/traverse');

const NegatedBooleans = require('./negated-booleans');

const CoreVisitor = traverse.visitors.merge([NegatedBooleans]);

console.log('CoreVisitor', CoreVisitor);

module.exports = CoreVisitor;
