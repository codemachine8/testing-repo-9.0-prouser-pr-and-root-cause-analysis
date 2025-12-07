// Test for stable→flaky transition detection

describe('Regression Tests', () => {
  test('test_became_flaky', async () => {
    // This test was stable, then became flaky
    const response = await fetch('/api/data');
    expect(response.status).toBe(200);
  });
});

