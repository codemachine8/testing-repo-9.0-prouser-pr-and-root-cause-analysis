// Level 1: Core utilities
const { level2Function } = require('../level2/middleware');

function level1CoreFunction() {
  return level2Function() + ' -> L1:core';
}

function level1HelperA() {
  return 'L1:helperA';
}

function level1HelperB() {
  return 'L1:helperB';
}

module.exports = {
  level1CoreFunction,
  level1HelperA,
  level1HelperB
};
