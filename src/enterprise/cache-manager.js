/**
 * Cache Manager - Handles in-memory caching with TTL support
 */

class CacheManager {
  constructor() {
    this.store = new Map();
    this.ttlMap = new Map();
    this.hitCount = 0;
    this.missCount = 0;
  }

  static instance = null;

  static getInstance() {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  static resetInstance() {
    CacheManager.instance = null;
  }

  async set(key, value, ttlMs = 60000) {
    this.store.set(key, value);
    this.ttlMap.set(key, Date.now() + ttlMs);
    return true;
  }

  async get(key) {
    const expiry = this.ttlMap.get(key);
    if (expiry && Date.now() > expiry) {
      this.store.delete(key);
      this.ttlMap.delete(key);
      this.missCount++;
      return null;
    }
    
    if (this.store.has(key)) {
      this.hitCount++;
      return this.store.get(key);
    }
    
    this.missCount++;
    return null;
  }

  async getOrSet(key, fetchFn, ttlMs = 60000) {
    let value = await this.get(key);
    if (value === null) {
      value = await fetchFn();
      await this.set(key, value, ttlMs);
    }
    return value;
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      size: this.store.size
    };
  }

  clear() {
    this.store.clear();
    this.ttlMap.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

module.exports = { CacheManager };

