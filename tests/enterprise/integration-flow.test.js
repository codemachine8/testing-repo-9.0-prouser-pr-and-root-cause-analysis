/**
 * Integration Flow Test Suite
 */

const { UserService } = require('../../src/enterprise/user-service');
const { OrderProcessor, ORDER_STATUS } = require('../../src/enterprise/order-processor');
const { getNotificationHub, resetNotificationHub } = require('../../src/enterprise/notification-hub');
const { getMetricsCollector, resetMetricsCollector } = require('../../src/enterprise/metrics-collector');
const { getSessionManager, resetSessionManager } = require('../../src/enterprise/session-manager');
const { CacheManager } = require('../../src/enterprise/cache-manager');
const config = require('../../src/enterprise/config-loader');

describe('IntegrationFlow', () => {
  let userService;
  let orderProcessor;
  let notificationHub;
  let metrics;
  let sessionManager;

  beforeEach(() => {
    userService = new UserService();
    orderProcessor = new OrderProcessor();
    notificationHub = getNotificationHub();
    metrics = getMetricsCollector();
    sessionManager = getSessionManager();
    
    notificationHub.registerChannel('email', async () => {
      await new Promise(r => setTimeout(r, 2));
    });
  });

  test('userPurchaseFlow', async () => {
    const session = sessionManager.createSession(1001);
    const user = await userService.getUser(1001);
    
    const order = await orderProcessor.createOrder(user.id, [
      { name: 'Widget', price: 19.99, quantity: 2 }
    ]);
    
    await orderProcessor.validateOrder(order.id);
    await orderProcessor.processOrder(order.id);
    
    await notificationHub.send({
      channel: 'email',
      recipient: user.email,
      body: `Order ${order.id} completed`
    });
    
    await notificationHub.processAll();
    
    metrics.increment('ordersCompleted');
    metrics.histogram('orderValue', order.total);
    
    expect(order.status).toBe(ORDER_STATUS.COMPLETED);
    expect(notificationHub.getStats().sent).toBeGreaterThanOrEqual(1);
  });

  test('multiUserOrdering', async () => {
    const userIds = [2001, 2002, 2003];
    const orderPromises = userIds.map(async (userId) => {
      const user = await userService.getUser(userId);
      return orderProcessor.createOrder(user.id, [
        { name: 'Item', price: 9.99, quantity: 1 }
      ]);
    });
    
    const orders = await Promise.all(orderPromises);
    
    for (const order of orders) {
      await orderProcessor.validateOrder(order.id);
    }
    
    const summary = await orderProcessor.getOrderSummary();
    expect(summary.validated).toBe(3);
  });

  test('sessionUserIntegration', async () => {
    const session = sessionManager.createSession(3001, { deviceType: 'mobile' });
    
    const user = await userService.getUser(3001);
    const activity = await userService.getUserActivity(3001);
    
    sessionManager.updateActivity(session.token);
    
    const retrieved = sessionManager.getSessionByToken(session.token);
    expect(retrieved.metadata.deviceType).toBe('mobile');
    expect(activity.isActive).toBe(true);
  });

  test('metricsIntegration', async () => {
    metrics.increment('apiCalls');
    
    await userService.getUser(4001);
    metrics.increment('apiCalls');
    
    const order = await orderProcessor.createOrder(4001, [
      { name: 'Test', price: 5, quantity: 1 }
    ]);
    metrics.increment('apiCalls');
    
    expect(metrics.getMetric('apiCalls')).toBeGreaterThanOrEqual(3);
  });

  test('cacheSharing', async () => {
    const cache = CacheManager.getInstance();
    
    await userService.getUser(5001);
    await userService.getUser(5001);
    
    const stats = cache.getStats();
    expect(stats.hitRate).toBeGreaterThan(0);
  });

  test('configPropagation', async () => {
    const settings = config.getConfig();
    
    expect(settings.apiTimeout).toBeGreaterThan(0);
    expect(settings.batchSize).toBeGreaterThan(0);
    
    const user = await userService.getUser(6001);
    expect(user).toBeDefined();
  });

  test('notificationOrderTracking', async () => {
    const events = [];
    
    orderProcessor.on('orderCompleted', async (order) => {
      await notificationHub.send({
        channel: 'email',
        recipient: 'customer@test.com',
        orderId: order.id
      });
      events.push('notification_queued');
    });
    
    const order = await orderProcessor.createOrder(7001, [
      { name: 'Product', price: 25, quantity: 1 }
    ]);
    await orderProcessor.validateOrder(order.id);
    await orderProcessor.processOrder(order.id);
    
    expect(events).toContain('notification_queued');
  });

  test('endToEndMetrics', async () => {
    const startTime = Date.now();
    
    const session = sessionManager.createSession(8001);
    const user = await userService.getUser(8001);
    
    const order = await orderProcessor.createOrder(user.id, [
      { name: 'Bundle', price: 99.99, quantity: 1 }
    ]);
    
    await orderProcessor.validateOrder(order.id);
    await orderProcessor.processOrder(order.id);
    
    const duration = Date.now() - startTime;
    metrics.histogram('e2eLatency', duration);
    
    const stats = metrics.getHistogramStats('e2eLatency');
    expect(stats).toBeDefined();
    expect(stats.count).toBeGreaterThanOrEqual(1);
  });

  test('errorRecoveryFlow', async () => {
    notificationHub.registerChannel('flaky', async () => {
      if (Math.random() < 0.5) throw new Error('Temporary failure');
    });
    
    for (let i = 0; i < 5; i++) {
      await notificationHub.send({ channel: 'flaky', recipient: `user${i}` });
    }
    
    await notificationHub.processAll();
    
    const stats = notificationHub.getStats();
    expect(stats.sent + stats.failed).toBe(5);
  });
});

