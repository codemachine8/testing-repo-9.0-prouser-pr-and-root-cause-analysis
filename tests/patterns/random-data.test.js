// Random data flaky tests - non-deterministic test data
describe('Random Data Tests', () => {
  test('test_random_number_flaky', () => {
    // Mock Math.random to return a fixed value
    const originalMathRandom = Math.random;
    Math.random = () => 0.6;

    const randomValue = Math.random() * 100;

    // Ensure the test is deterministic
    expect(randomValue).toBeGreaterThan(50);

    // Restore Math.random
    Math.random = originalMathRandom;
  });

  test('test_random_array_flaky', () => {
    // Flaky: array order randomness
    const items = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = items.sort(() => Math.random() - 0.5);

    // Fails when shuffle produces different order
    expect(shuffled[0]).toBe('a');
  });

  test('test_seeded_random_stable', () => {
    // Stable: using deterministic seed
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const value = seededRandom() * 100;
    expect(value).toBeGreaterThan(0);
  });
});
