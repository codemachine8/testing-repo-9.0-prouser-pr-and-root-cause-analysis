// Level 3: Service layer
const { level4Database } = require('../level4/database');

function level3Service() {
  return level4Database() + ' -> L3:service';
}

function level3ApiCall() {
  return 'L3:apiCall';
}

module.exports = {
  level3Service,
  level3ApiCall
};
