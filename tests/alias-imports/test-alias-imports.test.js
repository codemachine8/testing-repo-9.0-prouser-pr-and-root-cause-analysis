// Test: Alias-based imports (@/, ~/, @utils, etc.)
// Tests that configured aliases work and hashing includes them
// NOTE: Requires .flaky-autopilot.json configuration

// Using aliases (will work with enhanced resolver)
// These should resolve based on .flaky-autopilot.json config:
// "@" -> "./src"
// "@utils" -> "./src/utils"
// "~" -> "./"

// FALLBACK: If aliases don't work, tests use relative paths
// The action should log: "Aliases detected: X" if config loaded

const path = require('path');

// Try alias imports (enhanced resolver)
let utils, database, authHelper;
try {
  // These require .flaky-autopilot.json to be configured
  // If not configured, will fallback to relative imports below
  utils = require('@/utils');
  database = require('@/database');
  authHelper = require('@/auth-helper');
} catch (e) {
  // Fallback to relative imports
  console.log('⚠️  Alias imports failed, using relative paths');
  utils = require('../../src/utils');
  database = require('../../src/database');
  authHelper = require('../../src/auth-helper');
}

describe('Alias Import Tests', () => {
  test('test_alias_utils_import', () => {
    // Test that @/utils resolves correctly
    const result = utils.formatDate(new Date('2024-01-15'));
    expect(result).toBe('2024-01-15');
  });

  test('test_alias_database_import', () => {
    // Test that @/database resolves correctly
    const db = new database.Database();
    db.set('key1', 'value1');
    expect(db.get('key1')).toBe('value1');
  });

  test('test_alias_auth_helper_import', () => {
    // Test that @/auth-helper resolves correctly
    expect(authHelper.validateEmail('user@test.com')).toBe(true);
    expect(authHelper.validateEmail('invalid')).toBe(false);
  });

  test('test_alias_flaky_with_deps', () => {
    // Flaky test using alias imports
    // If any aliased dependency changes, hash should change
    const age = utils.calculateAge(1990);
    const isValid = authHelper.validateEmail('user@example.com');

    // Flaky condition
    if (Math.random() < 0.3) {
      throw new Error('Random failure with alias imports');
    }

    expect(age).toBeGreaterThan(0);
    expect(isValid).toBe(true);
  });

  test('test_mixed_alias_and_relative', () => {
    // Tests mixing alias and relative imports
    const relativeUtils = require('../../src/utils');
    const date1 = utils.formatDate(new Date('2024-01-01'));
    const date2 = relativeUtils.formatDate(new Date('2024-01-01'));

    // Should be the same module
    expect(date1).toBe(date2);
  });
});
