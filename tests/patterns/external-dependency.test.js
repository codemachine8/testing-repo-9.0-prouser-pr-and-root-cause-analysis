// External dependency flaky tests - network, filesystem, etc.
describe('External Dependency Tests', () => {
  test('test_network_call_flaky', async () => {
    // Flaky: real network call without retry logic
    const mockFetch = () => {
      if (Math.random() < 0.3) {
        return Promise.reject(new Error('ECONNREFUSED'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    };

    const response = await mockFetch();
    expect(response.ok).toBe(true);
  });

  test('test_file_system_flaky', () => {
    // Flaky: file system operations without error handling
    const fs = require('fs');
    const tempFile = `/tmp/test-${Date.now()}.txt`;

    try {
      fs.writeFileSync(tempFile, 'data');
      const content = fs.readFileSync(tempFile, 'utf-8');
      expect(content).toBe('data');
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Fails when filesystem is under load or permissions issue
      throw e;
    }
  });
});
