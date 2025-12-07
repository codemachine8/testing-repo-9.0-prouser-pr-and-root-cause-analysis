// Test file for async_wait category (HIGH confidence - should create PR)

describe('Async Tests', () => {
  test('test_missing_await', async () => {
    // This test is intentionally flaky - missing await
    await page.click('#login-button');
    await expect(page.locator('.welcome-message')).toBeVisible();
  });
});


