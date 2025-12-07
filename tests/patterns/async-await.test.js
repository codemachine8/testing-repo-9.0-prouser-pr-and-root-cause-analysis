// Async/await flaky tests - missing await is common issue
describe('Async Await Tests', () => {
  test('test_missing_await_flaky', async () => {
    // Flaky: missing await on promise
    const fetchData = () => new Promise(resolve => {
      setTimeout(() => resolve({ data: 'value' }), Math.random() * 50);
    });

    const result = fetchData(); // Missing await!

    // Fails when promise hasn't resolved yet
    try {
      expect(result.data).toBe('value');
    } catch (e) {
      // Handle the flaky failure
      throw new Error('Promise not resolved - missing await');
    }
  });

  test('test_proper_await_stable', async () => {
    // Stable: proper await
    const fetchData = () => new Promise(resolve => {
      setTimeout(() => resolve({ data: 'value' }), 10);
    });

    const result = await fetchData();
    expect(result.data).toBe('value');
  });
});
