// Test file for network_flake category (MEDIUM confidence - conditional PR)

describe('Network Tests', () => {
  test('test_api_call_flaky', () => {
    // This test simulates network flakiness - 30% failure rate
    const shouldFail = Math.random() < 0.3;

    if (shouldFail) {
      throw new Error('Network timeout: Connection timed out after 100ms');
    }

    // 70% of the time it passes
    expect(true).toBe(true);
  });
});

