/**
 * Notification Delivery Test Suite
 */

const { getNotificationHub, resetNotificationHub } = require('../../src/enterprise/notification-hub');
const config = require('../../src/enterprise/config-loader');

describe('NotificationDelivery', () => {
  let hub;

  beforeEach(() => {
    hub = getNotificationHub();
    
    hub.registerChannel('email', async (n) => {
      await new Promise(r => setTimeout(r, 5));
    });
    
    hub.registerChannel('sms', async (n) => {
      await new Promise(r => setTimeout(r, 3));
    });
    
    hub.registerChannel('push', async (n) => {
      await new Promise(r => setTimeout(r, 2));
    });
  });

  test('singleNotification', async () => {
    const notification = await hub.send({
      channel: 'email',
      recipient: 'user@example.com',
      subject: 'Test',
      body: 'Content'
    });
    
    expect(notification.id).toMatch(/^NOTIF-/);
    expect(notification.status).toBe('queued');
  });

  test('batchProcessing', async () => {
    for (let i = 0; i < 15; i++) {
      await hub.send({
        channel: 'email',
        recipient: `user${i}@example.com`,
        body: `Message ${i}`
      });
    }
    
    const results = await hub.processAll();
    
    expect(results.length).toBe(15);
    expect(results.every(r => r.success)).toBe(true);
  });

  test('channelRouting', async () => {
    await hub.send({ channel: 'email', recipient: 'a@test.com' });
    await hub.send({ channel: 'sms', recipient: '+1234567890' });
    await hub.send({ channel: 'push', recipient: 'device-token-123' });
    
    await hub.processAll();
    
    const stats = hub.getStats();
    expect(stats.sent).toBe(3);
  });

  test('failedChannelHandling', async () => {
    hub.registerChannel('broken', async () => {
      throw new Error('Service unavailable');
    });
    
    await hub.send({ channel: 'broken', recipient: 'test' });
    await hub.processAll();
    
    const stats = hub.getStats();
    expect(stats.failed).toBe(1);
  });

  test('eventEmission', async () => {
    const events = [];
    
    hub.on('queued', (n) => events.push({ event: 'queued', id: n.id }));
    hub.on('sent', (n) => events.push({ event: 'sent', id: n.id }));
    
    const notification = await hub.send({ channel: 'email', recipient: 'test@test.com' });
    await hub.processAll();
    
    expect(events.some(e => e.event === 'queued')).toBe(true);
    expect(events.some(e => e.event === 'sent')).toBe(true);
  });

  test('successRateCalculation', async () => {
    hub.registerChannel('unstable', async () => {
      if (Math.random() < 0.3) throw new Error('Random failure');
    });
    
    for (let i = 0; i < 10; i++) {
      await hub.send({ channel: 'unstable', recipient: `user${i}` });
    }
    
    await hub.processAll();
    const stats = hub.getStats();
    
    expect(stats.sent + stats.failed).toBe(10);
    expect(stats.successRate).toBeGreaterThanOrEqual(0);
    expect(stats.successRate).toBeLessThanOrEqual(1);
  });

  test('notificationRetrieval', async () => {
    const notification = await hub.send({ channel: 'email', recipient: 'find@me.com' });
    
    const found = hub.getNotificationById(notification.id);
    
    expect(found).toBeDefined();
    expect(found.recipient).toBe('find@me.com');
  });

  test('processingConcurrency', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 20; i++) {
      await hub.send({ channel: 'push', recipient: `device${i}` });
    }
    
    await hub.processAll();
    const duration = Date.now() - startTime;
    
    const stats = hub.getStats();
    expect(stats.sent).toBe(20);
  });
});

