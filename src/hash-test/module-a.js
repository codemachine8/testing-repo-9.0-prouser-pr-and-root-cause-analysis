// Hash Test Module A - VERSION 1
// This file will be modified to test hash change detection
const { moduleBFunction } = require('./module-b');

function moduleAFunction() {
  return 'ModuleA-V1:' + moduleBFunction();
}

function moduleAHelper() {
  return 'ModuleA-Helper-V1';
}

// Add comment to change file hash: CHANGE_1
module.exports = {
  moduleAFunction,
  moduleAHelper
};
