/**
 * Core Babel plugin
 */
const CoreVisitor = require('./visitors/core');

exports.default = ({ types: t }) => {
  return {
    name: 'prelim',
    visitor: CoreVisitor,
  };
};
