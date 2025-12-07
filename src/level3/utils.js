// Level 3: Utils
const { level4Logger } = require('../level4/logger');

function level3Utils() {
  return level4Logger() + ' -> L3:utils';
}

function level3Transform() {
  return 'L3:transform';
}

module.exports = {
  level3Utils,
  level3Transform
};
