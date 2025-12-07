// Test file for race_condition category (LOW confidence - should NOT create PR)

describe('Race Condition Tests', () => {
  test('test_concurrent_access', () => {
    // This test has a race condition
    updateUser(userId, { name: 'Alice' });
    updateUser(userId, { age: 30 });
    const user = getUser(userId);
    expect(user.name).toBe('Alice');
  });
});

