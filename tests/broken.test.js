// Test that always fails (0% pass rate - not flaky, just broken)

describe('Broken Tests', () => {
  test('test_always_fails', () => {
    // This test always fails - it's broken, not flaky
    expect(true).toBe(false);
  });
});

