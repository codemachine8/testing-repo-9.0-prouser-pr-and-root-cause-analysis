// Timing-based flaky tests - common real-world pattern
describe('Timing Sensitive Tests', () => {
  test('test_race_condition_flaky', async () => {
    // Flaky due to race condition
    let value = 0;

    setTimeout(() => { value = 1; }, 10);
    setTimeout(() => { value = 2; }, 10);

    await new Promise(resolve => setTimeout(resolve, 15));

    // Fails ~50% when value is 1 instead of 2
    expect(value).toBe(2);
  });

  test('test_timeout_flaky', async () => {
    // Flaky due to inconsistent timing
    const delay = Math.random() * 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 50));
    const elapsed = Date.now() - start;

    // Fails when system is under load
    expect(elapsed).toBeLessThan(60);
  });
});
