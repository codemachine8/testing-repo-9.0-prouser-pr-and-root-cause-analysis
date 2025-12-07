// Test: 4-level deep import chain
// Validates that changes at ANY level trigger hash change
// L1 -> L2 -> L3 -> L4
const { level1CoreFunction, level1HelperA } = require('../../src/level1/core');
const { level2ProcessorA } = require('../../src/level2/middleware');
const { level4Transaction, level4Query } = require('../../src/level4/database');
const { level4LogError } = require('../../src/level4/logger');

describe('Deep Import Chain Tests (4 Levels)', () => {
  test('test_4_level_import_chain', () => {
    // This test depends on: L1 -> L2 -> L3 -> L4
    // If L4 changes, hash should change
    const result = level1CoreFunction();
    expect(result).toContain('L4:database');
    expect(result).toContain('L1:core');
  });

  test('test_4_level_flaky_transaction', () => {
    // Flaky: L4 database transaction fails 30% of time
    // Tests dependency tracking with flaky deep import
    try {
      const result = level4Transaction();
      expect(result).toBe('L4:transaction');
    } catch (error) {
      // Expected flakiness from deep dependency
      expect(error.message).toContain('transaction failed');
    }
  });

  test('test_4_level_logger_flaky', () => {
    // Flaky: L4 logger fails 20% of time
    try {
      const result = level4LogError();
      expect(result).toBe('L4:logError');
    } catch (error) {
      expect(error.message).toContain('Logger failed');
    }
  });

  test('test_multiple_deep_imports', () => {
    // Tests that importing multiple deep chains works
    const a = level1HelperA();
    const b = level2ProcessorA();
    const c = level4Query();

    expect(a).toBe('L1:helperA');
    expect(b).toContain('L4:logger');
    expect(c).toBe('L4:query');
  });

  test('test_stable_with_deep_deps', () => {
    // Stable test with deep dependencies
    // Verifies hash calculation includes all levels
    const result = level1CoreFunction();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
