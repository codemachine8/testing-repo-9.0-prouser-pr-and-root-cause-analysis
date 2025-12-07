// Test with dependencies - validates import parsing and hash calculation
const { validateEmail, hashPassword } = require('../../src/auth-helper');

describe('Authentication with Dependencies', () => {
  test('test_email_validation_flaky', () => {
    // Fixed test with deterministic email
    const email = 'user@example.com';
    expect(validateEmail(email)).toBe(true);
  });

  test('test_password_hashing_stable', () => {
    // Stable test with dependency
    const hashed = hashPassword('mypassword');
    expect(hashed).toBe('hashed_mypassword');
  });
});
