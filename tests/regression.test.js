// Test for stable→flaky transition detection

describe('Regression Tests', () => {
  test('test_became_flaky', async () => {
    // This test was stable, then became flaky
    try {
      const response = await fetch('/api/data');
      expect(response.status).toBe(200);
    } catch (error) {
      console.error('API fetch failed:', error);
      throw new Error('External API is unavailable');
    }
  });
});

