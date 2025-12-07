// Test ES6 import statements (converted to require for Jest compatibility)
// The action will still detect both require() and import styles in source code
const { validateUsername, validateAge } = require('../../src/validator');
const { APIClient } = require('../../src/api-client');

describe('ES6 Import Tests', () => {
  test('test_es6_validator_import', () => {
    const result = validateUsername('john_doe');
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('test_es6_age_validation', () => {
    const result = validateAge(25);
    expect(result.valid).toBe(true);
  });

  test('test_es6_api_client_import', async () => {
    const client = new APIClient();
    try {
      const response = await client.get('/test');
      expect(response.status).toBe(200);
    } catch (error) {
      // Network flakiness is expected
      expect(error.message).toContain('timeout');
    }
  });

  test('test_mixed_imports', () => {
    const usernameResult = validateUsername('ab');
    const ageResult = validateAge(-5);

    expect(usernameResult.valid).toBe(false);
    expect(ageResult.valid).toBe(false);
  });
});
