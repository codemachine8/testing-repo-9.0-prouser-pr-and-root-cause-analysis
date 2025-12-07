// Stable test - should NOT be flagged as flaky

describe('Stable Tests', () => {
  test('test_stable_not_flaky', () => {
    // This test is stable - should pass consistently
    const result = 1 + 1;
    expect(result).toBe(2);
  });
});

