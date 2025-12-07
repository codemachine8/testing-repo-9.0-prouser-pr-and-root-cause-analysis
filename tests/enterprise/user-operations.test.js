/**
 * User Operations Test Suite
 */

const { UserService } = require('../../src/enterprise/user-service');
const { CacheManager } = require('../../src/enterprise/cache-manager');
const config = require('../../src/enterprise/config-loader');

describe('UserOperations', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
  });

  test('fetchUserData', async () => {
    const user = await userService.getUser(12345);
    
    expect(user).toBeDefined();
    expect(user.id).toBe(12345);
    expect(user.email).toContain('@');
  });

  test('multipleUserFetch', async () => {
    const users = await userService.getUsers([1, 2, 3, 4, 5]);
    
    expect(users).toHaveLength(5);
    expect(users.every(u => u.status === 'active')).toBe(true);
  });

  test('userActivityCalculation', async () => {
    const activity = await userService.getUserActivity(999);
    
    expect(activity.avgLoginsPerDay).toBeGreaterThanOrEqual(0);
    expect(activity.isActive).toBe(true);
    expect(activity.accountAgeInDays).toBeGreaterThanOrEqual(0);
  });

  test('cachePerformance', async () => {
    const cache = CacheManager.getInstance();
    
    // First call
    await userService.getUser(777);
    const stats1 = cache.getStats();
    
    // Second call should hit cache
    await userService.getUser(777);
    const stats2 = cache.getStats();
    
    expect(stats2.hits).toBeGreaterThan(stats1.hits);
  });

  test('userUpdatePersistence', async () => {
    const userId = 5001;
    await userService.getUser(userId);
    
    const updated = await userService.updateUser(userId, { status: 'premium' });
    expect(updated.status).toBe('premium');
    
    const fetched = await userService.getUser(userId);
    expect(fetched.status).toBe('premium');
  });

  test('serviceStatistics', async () => {
    const initialStats = userService.getStats();
    
    await userService.getUser(100);
    await userService.getUser(101);
    await userService.getUser(102);
    
    const finalStats = userService.getStats();
    
    expect(finalStats.requestCount).toBe(initialStats.requestCount + 3);
    expect(finalStats.lastRequestTime).toBeGreaterThan(0);
  });

  test('configurationIntegration', async () => {
    const settings = config.getConfig();
    
    expect(settings.cacheEnabled).toBeDefined();
    expect(settings.apiTimeout).toBeGreaterThan(0);
    
    const user = await userService.getUser(2000);
    expect(user).toBeDefined();
  });
});

