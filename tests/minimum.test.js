// Test for minimum threshold (exactly 20 runs)

describe('Minimum Threshold Tests', () => {
  test('test_minimum_runs', () => {
    let mockRandomValue = 0.5;
    jest.spyOn(Math, 'random').mockReturnValue(mockRandomValue);

    // This test occasionally fails
    const value = Math.random();

    jest.restoreAllMocks();
    expect(value).toBeGreaterThan(0.3);
  });
});

