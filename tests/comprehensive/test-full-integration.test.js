// COMPREHENSIVE INTEGRATION TEST
// Tests all aspects of import tracking, hashing, and flaky detection

// Deep imports (4 levels)
const { level1CoreFunction } = require('../../src/level1/core');
const { level4Transaction } = require('../../src/level4/database');

// Direct imports
const { formatDate, calculateAge } = require('../../src/utils');
const { Database } = require('../../src/database');
const { validateEmail } = require('../../src/auth-helper');

// Hash test imports
const { moduleAFunction } = require('../../src/hash-test/module-a');

describe('Comprehensive Integration Tests', () => {
  // TEST 1: Stable test with many imports
  test('integration_stable_many_imports', () => {
    const date = formatDate(new Date('2024-01-01'));
    const age = calculateAge(2000);
    const email = validateEmail('test@test.com');
    const chain = level1CoreFunction();
    const hashTest = moduleAFunction();

    expect(date).toBe('2024-01-01');
    expect(age).toBeGreaterThan(20); // 2025 - 2000 = 25
    expect(email).toBe(true);
    expect(chain).toContain('L4:database');
    expect(hashTest).toContain('ModuleC');
  });

  // TEST 2: Flaky test with deep dependency
  test('integration_flaky_deep_dependency', () => {
    // This test is flaky because level4Transaction fails 30% of time
    // Tests that flakiness in deep dependency is detected
    // AND that hash includes the deep dependency
    try {
      const result = level4Transaction();
      expect(result).toBe('L4:transaction');
    } catch (error) {
      // Expected flaky behavior
      expect(error.message).toContain('transaction failed');
    }
  });

  // TEST 3: Test that validates hash includes ALL dependencies
  test('integration_hash_includes_all_levels', () => {
    // This test's hash should include:
    // 1. This test file itself
    // 2. src/level1/core.js (direct import)
    // 3. src/level2/middleware.js (L1 imports it)
    // 4. src/level3/services.js (L2 imports it)
    // 5. src/level4/database.js (L3 imports it)
    // 6. src/level3/utils.js (L2 imports it)
    // 7. src/level4/logger.js (L3/utils imports it)
    // 8. src/utils.js (direct import)
    // 9. src/database.js (direct import)
    // 10. src/auth-helper.js (direct import)
    // 11. src/hash-test/module-a.js (direct import)
    // 12. src/hash-test/module-b.js (module-a imports it)
    // 13. src/hash-test/module-c.js (module-b imports it)
    //
    // Total: ~13 files in dependency graph

    const result = level1CoreFunction();
    expect(typeof result).toBe('string');
  });

  // TEST 4: Performance test with complex dependency graph
  test('integration_performance_complex_deps', () => {
    const start = Date.now();

    // Execute functions from multiple dependency levels
    formatDate(new Date());
    calculateAge(1990);
    validateEmail('test@test.com');
    level1CoreFunction();
    moduleAFunction();

    const duration = Date.now() - start;

    // Should be fast even with complex dependencies
    expect(duration).toBeLessThan(50);
  });

  // TEST 5: Flaky test with multiple import sources
  test('integration_flaky_multiple_sources', () => {
    // Combines multiple potential points of flakiness
    const db = new Database();
    db.set('key', 'value');

    // Random failure
    if (Math.random() < 0.3) {
      throw new Error('Random integration failure');
    }

    // Deep import that might fail
    try {
      level4Transaction();
    } catch (e) {
      // Acceptable failure
    }

    expect(db.get('key')).toBe('value');
  });

  // TEST 6: Validates transitive dependency tracking
  test('integration_transitive_dependencies', () => {
    // This test only directly imports level1CoreFunction
    // But it should track ALL transitive dependencies
    // If ANY file in the chain changes, hash should change

    const result = level1CoreFunction();

    // Result includes markers from all levels
    expect(result).toContain('L1:core');
    expect(result).toContain('L2:middleware');
    expect(result).toContain('L3:service');
    expect(result).toContain('L4:database');
  });

  // TEST 7: Hash stability test
  test('integration_hash_stability', () => {
    // Running same code multiple times should give same results
    // This validates hash calculation is deterministic

    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(level1CoreFunction());
    }

    // All results should be identical
    const allSame = results.every(r => r === results[0]);
    expect(allSame).toBe(true);
  });

  // TEST 8: Mixed import types
  test('integration_mixed_import_types', () => {
    // Tests using both CommonJS require and potential ES6 imports
    // Validates both are detected correctly

    const utils = require('../../src/utils');
    const db = require('../../src/database');
    const auth = require('../../src/auth-helper');

    expect(utils.formatDate).toBeDefined();
    expect(db.Database).toBeDefined();
    expect(auth.validateEmail).toBeDefined();
  });

  // TEST 9: Validates no duplicate hashing
  test('integration_no_duplicate_hashing', () => {
    // Imports same module multiple times
    // Hash should only include it once

    const utils1 = require('../../src/utils');
    const utils2 = require('../../src/utils');
    const utils3 = require('../../src/utils');

    // All should reference same module
    expect(utils1).toBe(utils2);
    expect(utils2).toBe(utils3);
  });

  // TEST 10: Comprehensive flaky test for AI analysis
  test('integration_flaky_for_ai_analysis', async () => {
    // This test has multiple flaky patterns for AI to analyze:
    // 1. Random failure
    // 2. Deep dependency failure
    // 3. Async timing issue

    // Random flakiness
    if (Math.random() < 0.25) {
      throw new Error('Random failure point 1');
    }

    // Deep dependency flakiness
    try {
      level4Transaction();
    } catch (e) {
      if (Math.random() < 0.5) {
        throw new Error('Cascading failure from deep dependency');
      }
    }

    // Timing flakiness
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

    if (Math.random() < 0.2) {
      throw new Error('Timing-related failure');
    }

    // If we get here, test passes
    expect(true).toBe(true);
  });
});

// VALIDATION NOTES:
// =================
//
// After running this test suite multiple times:
//
// 1. Check import detection:
//    - integration_stable_many_imports: Should show 11-13 imports
//    - integration_hash_includes_all_levels: Should show 13+ imports
//
// 2. Check flaky detection:
//    - integration_flaky_deep_dependency: ~70% pass rate
//    - integration_flaky_multiple_sources: ~70% pass rate
//    - integration_flaky_for_ai_analysis: ~50% pass rate
//
// 3. Check hash behavior:
//    - Modify src/level4/database.js → All deep tests should change hash
//    - Modify src/utils.js → Most tests should change hash
//    - Modify test file → All tests in file should change hash
//
// 4. Check AI analysis:
//    - Flaky tests should trigger fix generation
//    - Fixes should reference correct dependencies
//    - Confidence scores should be reasonable
//
// 5. Check performance:
//    - integration_performance_complex_deps should complete <50ms
//    - Full suite should complete <2 seconds
//    - Action should process in <60 seconds total
