// Test: Hash Change Detection
// These tests validate that the action correctly detects when:
// 1. The test file itself changes
// 2. A direct import changes (module-a)
// 3. A 2nd-level import changes (module-b)
// 4. A 3rd-level import changes (module-c)
//
// To validate: Run action, note hashes, modify files, run again, compare hashes

const { moduleAFunction, moduleAHelper } = require('../../src/hash-test/module-a');

describe('Hash Change Detection Tests', () => {
  test('test_hash_baseline', () => {
    // Baseline test - DO NOT MODIFY THIS TEST
    // Hash: Should remain constant if no files change
    const result = moduleAFunction();
    expect(result).toContain('ModuleA');
    expect(result).toContain('ModuleB');
    expect(result).toContain('ModuleC');
  });

  test('test_hash_with_direct_import', () => {
    // Test with direct import: module-a
    // If module-a.js changes, this test's hash SHOULD change
    const result = moduleAHelper();
    expect(result).toContain('ModuleA-Helper');
  });

  test('test_hash_with_deep_import', () => {
    // Test with 3-level import chain: A -> B -> C
    // If module-c.js changes (deepest), this test's hash SHOULD change
    const result = moduleAFunction();
    expect(result).toContain('ModuleC');
  });

  test('test_hash_flaky_with_imports', () => {
    // Flaky test with imports
    // Hash should include all import dependencies
    const result = moduleAFunction();
    expect(result.length).toBeGreaterThan(0);
  });

  // MODIFICATION INSTRUCTIONS FOR VALIDATION:
  //
  // Run 1: Get baseline hashes
  //   - Note hash for each test
  //
  // Run 2: Modify THIS test file (add comment below)
  //   - Expected: All 4 test hashes change
  //
  // Run 3: Modify module-a.js (change CHANGE_1 to CHANGE_2)
  //   - Expected: All 4 test hashes change (all tests import module-a)
  //
  // Run 4: Modify module-b.js (change CHANGE_1 to CHANGE_2)
  //   - Expected: test_hash_baseline and test_hash_with_deep_import hashes change
  //   - Expected: test_hash_with_direct_import NO CHANGE (doesn't use module-b)
  //
  // Run 5: Modify module-c.js (change CHANGE_1 to CHANGE_2)
  //   - Expected: test_hash_baseline and test_hash_with_deep_import hashes change
  //   - Expected: test_hash_with_direct_import NO CHANGE (doesn't use module-c)
  //
  // MODIFICATION MARKER: CHANGE_1
});
