// Edge case test - barely flaky

describe('Edge Case Tests', () => {
  test('test_barely_flaky', () => {
    // This test occasionally fails
    const result = Math.random();
    expect(result).toBeLessThan(0.999); // Fails ~0.1% of the time
  });
});

