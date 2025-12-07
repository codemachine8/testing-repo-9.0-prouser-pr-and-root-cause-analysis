// Test for timing dependency issues

describe('Timing Dependency Tests', () => {
  test('test_timing_sleep', () => {
    // This test simulates timing race condition - random pass/fail
    // 50% chance the element is "ready" when we check
    const isReady = Math.random() > 0.5;

    const element = {
      classList: {
        contains: (className) => {
          if (className === 'ready') {
            return isReady;
          }
          return false;
        },
        add: () => {}
      }
    };

    // Immediately checks - race condition!
    expect(element.classList.contains('ready')).toBe(true);
  });
});

