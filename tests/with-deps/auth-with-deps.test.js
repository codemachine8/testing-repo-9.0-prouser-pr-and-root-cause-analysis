// Test with dependencies - validates import parsing and hash calculation
const { validateEmail, hashPassword } = require('../../src/auth-helper');

describe('Authentication with Dependencies', () => {
  test('test_email_validation_flaky', () => {
    // Flaky test that depends on auth-helper.js
    // If auth-helper.js changes, hash should change
    const email = Math.random() > 0.3 ? 'user@example.com' : 'invalid';
    expect(validateEmail(email)).toBe(true);
  });

  test('test_password_hashing_stable', () => {
    // Stable test with dependency
    const hashed = hashPassword('mypassword');
    expect(hashed).toBe('hashed_mypassword');
  });
});
