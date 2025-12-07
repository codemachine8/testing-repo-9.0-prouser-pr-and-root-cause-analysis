// Hash Test Module B - VERSION 1
const { moduleCFunction } = require('./module-c');

function moduleBFunction() {
  return 'ModuleB-V1:' + moduleCFunction();
}

// Add comment to change file hash: CHANGE_1
module.exports = {
  moduleBFunction
};
