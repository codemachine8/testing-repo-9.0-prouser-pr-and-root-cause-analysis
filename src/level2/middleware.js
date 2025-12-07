// Level 2: Middleware layer
const { level3Service } = require('../level3/services');
const { level3Utils } = require('../level3/utils');

function level2Function() {
  return level3Service() + ' -> L2:middleware';
}

function level2ProcessorA() {
  return level3Utils() + ' -> L2:processorA';
}

function level2ProcessorB() {
  return 'L2:processorB';
}

module.exports = {
  level2Function,
  level2ProcessorA,
  level2ProcessorB
};
