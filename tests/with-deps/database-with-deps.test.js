// Test with dependencies - validates state pollution detection
const { db } = require('../../src/database');

describe('Database Tests with Dependencies', () => {
  test('test_user_update_flaky', () => {
    // Flaky due to state pollution - depends on database.js
    db.updateUser('user1', { name: 'Alice' });

    // Sometimes fails if previous test didn't clean up
    if (Math.random() > 0.4) {
      db.clear();
    }

    const user = db.getUser('user1');
    expect(user).toBeNull();
  });

  test('test_user_read_stable', () => {
    // Stable test with proper cleanup
    db.clear();
    db.updateUser('user2', { name: 'Bob' });
    const user = db.getUser('user2');
    expect(user.name).toBe('Bob');
    db.clear();
  });
});
