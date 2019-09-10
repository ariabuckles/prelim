const t = require('@babel/types');
const traverse = require('@babel/traverse');

const NegatedBooleans = require('./negated-booleans');

const CoreVisitor = traverse.visitors.merge([NegatedBooleans]);

module.exports = CoreVisitor;
