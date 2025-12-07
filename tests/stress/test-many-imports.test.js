// Stress Test: Many imports (15+ files)
// Tests hash calculation performance and correctness with many dependencies
const { formatDate, calculateAge, sleep } = require('../../src/utils');
const { Database } = require('../../src/database');
const { validateEmail, hashPassword } = require('../../src/auth-helper');
const { APIClient } = require('../../src/api-client');
const { level1CoreFunction, level1HelperA, level1HelperB } = require('../../src/level1/core');
const { level2Function, level2ProcessorA, level2ProcessorB } = require('../../src/level2/middleware');
const { level3Service, level3ApiCall } = require('../../src/level3/services');
const { level3Utils, level3Transform } = require('../../src/level3/utils');
const { level4Database, level4Query, level4Transaction } = require('../../src/level4/database');
const { level4Logger, level4LogError } = require('../../src/level4/logger');

// Total: 10 direct imports + transitive dependencies
// Should result in 15+ files in dependency graph

describe('Stress Test: Many Imports', () => {
  test('test_many_imports_stable', () => {
    // Stable test with many imports
    // Hash calculation should handle all dependencies
    const date = formatDate(new Date('2024-01-01'));
    const age = calculateAge(2000);
    const email = validateEmail('test@example.com');
    const chain = level1CoreFunction();

    expect(date).toBe('2024-01-01');
    expect(age).toBeGreaterThan(0);
    expect(email).toBe(true);
    expect(chain).toContain('L4:database');
  });

  test('test_many_imports_uses_all', () => {
    // Test that actually uses imports from all levels
    const db = new Database();
    const api = new APIClient();
    const l1a = level1HelperA();
    const l1b = level1HelperB();
    const l2a = level2ProcessorA();
    const l2b = level2ProcessorB();
    const l3a = level3ApiCall();
    const l3b = level3Transform();
    const l4 = level4Query();

    db.set('key', 'value');
    expect(db.get('key')).toBe('value');
    expect(l1a).toBe('L1:helperA');
    expect(l1b).toBe('L1:helperB');
    expect(l2b).toBe('L2:processorB');
    expect(l3a).toBe('L3:apiCall');
    expect(l3b).toBe('L3:transform');
    expect(l4).toBe('L4:query');
  });

  test('test_many_imports_flaky_deep', () => {
    // Flaky test with deep import that might fail
    // Tests hash recalculation when deep dependency changes
    try {
      const result = level4Transaction();
      expect(result).toBe('L4:transaction');
    } catch (error) {
      // Expected flaky behavior from deep import
      expect(error.message).toContain('transaction failed');
    }
  });

  test('test_many_imports_multiple_flaky', () => {
    // Multiple flaky points in dependency tree
    let errors = 0;

    try {
      level4Transaction();
    } catch (e) {
      errors++;
    }

    try {
      level4LogError();
    } catch (e) {
      errors++;
    }

    // At least one should work, but might have 0-2 errors
    expect(errors).toBeGreaterThanOrEqual(0);
    expect(errors).toBeLessThanOrEqual(2);
  });

  test('test_many_imports_performance', async () => {
    // Tests that many imports don't cause performance issues
    const start = Date.now();

    // Call functions from all imports
    formatDate(new Date());
    calculateAge(1990);
    validateEmail('test@test.com');
    hashPassword('password');
    level1CoreFunction();
    level2ProcessorA();
    level3Service();
    level4Database();

    const duration = Date.now() - start;

    // Should be fast (< 100ms) even with many imports
    expect(duration).toBeLessThan(100);
  });

  test('test_hash_stability_with_many_imports', () => {
    // Tests that hash is stable across multiple runs
    // with same source code
    const result1 = level1CoreFunction();
    const result2 = level1CoreFunction();
    const result3 = level1CoreFunction();

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });
});
