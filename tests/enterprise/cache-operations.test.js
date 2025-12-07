/**
 * Cache Operations Test Suite
 */

const { CacheManager } = require('../../src/enterprise/cache-manager');
const config = require('../../src/enterprise/config-loader');

describe('CacheOperations', () => {
  let cache;

  beforeEach(() => {
    cache = CacheManager.getInstance();
  });

  test('basicSetGet', async () => {
    await cache.set('key1', { data: 'value1' });
    const result = await cache.get('key1');
    
    expect(result.data).toBe('value1');
  });

  test('cacheExpiration', async () => {
    await cache.set('expiring', 'data', 50);
    
    const immediate = await cache.get('expiring');
    expect(immediate).toBe('data');
    
    await new Promise(resolve => setTimeout(resolve, 60));
    
    const expired = await cache.get('expiring');
    expect(expired).toBeNull();
  });

  test('getOrSetFetch', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return { fetched: true };
    };
    
    await cache.getOrSet('lazy', fetcher);
    await cache.getOrSet('lazy', fetcher);
    await cache.getOrSet('lazy', fetcher);
    
    expect(fetchCount).toBe(1);
  });

  test('hitMissStatistics', async () => {
    cache.clear();
    
    await cache.set('exists', 'yes');
    
    await cache.get('exists');
    await cache.get('exists');
    await cache.get('missing');
    
    const stats = cache.getStats();
    
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.666, 1);
  });

  test('clearOperation', async () => {
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.set('c', 3);
    
    cache.clear();
    
    const stats = cache.getStats();
    expect(stats.size).toBe(0);
  });

  test('concurrentAccess', async () => {
    const operations = [];
    
    for (let i = 0; i < 20; i++) {
      operations.push(cache.set(`concurrent:${i}`, i));
    }
    
    await Promise.all(operations);
    
    const reads = [];
    for (let i = 0; i < 20; i++) {
      reads.push(cache.get(`concurrent:${i}`));
    }
    
    const results = await Promise.all(reads);
    expect(results.filter(r => r !== null).length).toBe(20);
  });

  test('singletonBehavior', () => {
    const instance1 = CacheManager.getInstance();
    const instance2 = CacheManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  test('complexObjectStorage', async () => {
    const complex = {
      nested: {
        array: [1, 2, { deep: true }],
        date: new Date().toISOString()
      },
      fn: 'cannot serialize functions'
    };
    
    await cache.set('complex', complex);
    const retrieved = await cache.get('complex');
    
    expect(retrieved.nested.array[2].deep).toBe(true);
  });

  test('largeCachePerformance', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await cache.set(`perf:${i}`, { index: i, data: 'x'.repeat(100) });
    }
    
    const duration = Date.now() - startTime;
    
    expect(cache.getStats().size).toBeGreaterThanOrEqual(100);
  });

  test('ttlVariations', async () => {
    await cache.set('short', 'data', 30);
    await cache.set('medium', 'data', 100);
    await cache.set('long', 'data', 200);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(await cache.get('short')).toBeNull();
    expect(await cache.get('medium')).toBe('data');
    expect(await cache.get('long')).toBe('data');
  });
});

