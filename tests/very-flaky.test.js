// Edge case test - very flaky

describe('Very Flaky Tests', () => {
  test('test_very_flaky', () => {
    // This test fails most of the time
    const result = Math.random();
    expect(result).toBeGreaterThan(0.7); // Only passes ~30% of the time
  });
});

