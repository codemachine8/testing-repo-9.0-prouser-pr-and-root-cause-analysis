// Utility functions for testing import detection

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function calculateAge(birthYear) {
  return new Date().getFullYear() - birthYear;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  formatDate,
  calculateAge,
  sleep
};
