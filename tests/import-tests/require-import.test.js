// Test CommonJS require imports
const { formatDate, calculateAge, sleep } = require('../../src/utils');
const { db } = require('../../src/database');
const { validateEmail } = require('../../src/auth-helper');

describe('CommonJS Require Import Tests', () => {
  test('test_require_utils_import', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  test('test_require_database_import', () => {
    db.clear();
    db.updateUser('user1', { name: 'Alice' });
    expect(db.getUser('user1').name).toBe('Alice');
    db.clear();
  });

  test('test_require_auth_import', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });

  test('test_multiple_requires', () => {
    const age = calculateAge(1990);
    const isValid = validateEmail('user@test.com');
    expect(age).toBeGreaterThan(0);
    expect(isValid).toBe(true);
  });
});
