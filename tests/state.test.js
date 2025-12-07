// Test for state pollution between tests

let globalCounter = 0;

describe('State Pollution Tests', () => {
  test('test_global_state_leak', () => {
    // This test leaks global state
    globalCounter++;
    expect(globalCounter).toBe(1); // Fails if run after itself!
  });
});

