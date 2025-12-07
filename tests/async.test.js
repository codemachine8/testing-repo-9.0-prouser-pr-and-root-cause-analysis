// Test file for async_wait category (HIGH confidence - should create PR)

describe('Async Tests', () => {
  test('test_missing_await', () => {
    // This test is intentionally flaky - missing await
    page.click('#login-button');
    expect(page.locator('.welcome-message')).toBeVisible();
  });
});


