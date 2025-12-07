// Level 4: Logger (deepest)
function level4Logger() {
  return 'L4:logger';
}

function level4LogError() {
  // Flaky - sometimes fails
  if (Math.random() < 0.2) {
    throw new Error('Logger failed');
  }
  return 'L4:logError';
}

module.exports = {
  level4Logger,
  level4LogError
};
