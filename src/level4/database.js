// Level 4: Database (deepest)
function level4Database() {
  return 'L4:database';
}

function level4Query() {
  return 'L4:query';
}

function level4Transaction() {
  // Flaky behavior - 30% fail
  if (Math.random() < 0.3) {
    throw new Error('Database transaction failed');
  }
  return 'L4:transaction';
}

module.exports = {
  level4Database,
  level4Query,
  level4Transaction
};
