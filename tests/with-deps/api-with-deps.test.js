// Test with dependencies - validates import parsing for API calls
const { APIClient } = require('../../src/api-client');

describe('API Tests with Dependencies', () => {
  test('test_api_call_with_retry', async () => {
    // Flaky test - depends on api-client.js
    const client = new APIClient('https://api.example.com');
    const response = await client.fetch('/users');
    expect(response.status).toBe(200);
  });
});
