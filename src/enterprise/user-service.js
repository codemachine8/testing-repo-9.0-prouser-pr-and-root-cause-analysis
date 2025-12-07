/**
 * User Service - Handles user operations with caching
 */

const { CacheManager } = require('./cache-manager');
const config = require('./config-loader');

class UserService {
  constructor(cacheManager = null) {
    this.cache = cacheManager || CacheManager.getInstance();
    this.requestCount = 0;
    this.lastRequestTime = null;
  }

  async fetchUserFromDB(userId) {
    // Simulate database latency
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
    
    return {
      id: userId,
      username: `user_${userId}`,
      email: `user${userId}@example.com`,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 365),
      status: 'active',
      metadata: {
        loginCount: Math.floor(Math.random() * 1000),
        lastSeen: new Date()
      }
    };
  }

  async getUser(userId) {
    this.requestCount++;
    this.lastRequestTime = Date.now();

    const settings = config.getConfig();
    
    if (settings.cacheEnabled) {
      return this.cache.getOrSet(
        `user:${userId}`,
        () => this.fetchUserFromDB(userId),
        60000
      );
    }
    
    return this.fetchUserFromDB(userId);
  }

  async getUsers(userIds) {
    const results = await Promise.all(
      userIds.map(id => this.getUser(id))
    );
    return results;
  }

  async updateUser(userId, updates) {
    const user = await this.getUser(userId);
    const updated = { ...user, ...updates, updatedAt: new Date() };
    
    await this.cache.set(`user:${userId}`, updated);
    return updated;
  }

  async deleteUser(userId) {
    this.cache.store.delete(`user:${userId}`);
    return { deleted: true, userId };
  }

  async getUserActivity(userId) {
    const user = await this.getUser(userId);
    const now = Date.now();
    const daysSinceCreation = (now - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      userId,
      avgLoginsPerDay: user.metadata.loginCount / Math.max(daysSinceCreation, 1),
      isActive: user.status === 'active',
      accountAgeInDays: Math.floor(daysSinceCreation)
    };
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      cacheStats: this.cache.getStats()
    };
  }
}

module.exports = { UserService };

