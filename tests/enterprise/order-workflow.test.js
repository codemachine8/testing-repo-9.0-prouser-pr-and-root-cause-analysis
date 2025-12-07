/**
 * Order Workflow Test Suite
 */

const { OrderProcessor, ORDER_STATUS } = require('../../src/enterprise/order-processor');
const { CacheManager } = require('../../src/enterprise/cache-manager');
const config = require('../../src/enterprise/config-loader');

describe('OrderWorkflow', () => {
  let processor;
  const validItems = [
    { name: 'Product A', price: 29.99, quantity: 2 },
    { name: 'Product B', price: 49.99, quantity: 1 }
  ];

  beforeEach(() => {
    processor = new OrderProcessor();
  });

  test('orderCreation', async () => {
    const order = await processor.createOrder(1001, validItems);
    
    expect(order.id).toMatch(/^ORD-/);
    expect(order.status).toBe(ORDER_STATUS.PENDING);
    expect(order.total).toBeCloseTo(109.97, 2);
  });

  test('orderValidation', async () => {
    const order = await processor.createOrder(1002, validItems);
    const result = await processor.validateOrder(order.id);
    
    expect(result.isValid).toBe(true);
    expect(result.order.status).toBe(ORDER_STATUS.VALIDATED);
  });

  test('fullOrderLifecycle', async () => {
    const events = [];
    
    processor.on('orderCreated', (o) => events.push({ type: 'created', id: o.id }));
    processor.on('orderValidated', (e) => events.push({ type: 'validated', id: e.order.id }));
    processor.on('orderCompleted', (o) => events.push({ type: 'completed', id: o.id }));
    
    const order = await processor.createOrder(1003, validItems);
    await processor.validateOrder(order.id);
    await processor.processOrder(order.id);
    
    expect(events).toHaveLength(3);
    expect(events[0].type).toBe('created');
    expect(events[1].type).toBe('validated');
    expect(events[2].type).toBe('completed');
  });

  test('orderSummaryAccuracy', async () => {
    await processor.createOrder(2001, validItems);
    await processor.createOrder(2002, validItems);
    
    const order3 = await processor.createOrder(2003, validItems);
    await processor.validateOrder(order3.id);
    await processor.processOrder(order3.id);
    
    const summary = await processor.getOrderSummary();
    
    expect(summary.total).toBe(3);
    expect(summary.pending).toBe(2);
    expect(summary.completed).toBe(1);
    expect(summary.totalRevenue).toBeGreaterThan(0);
  });

  test('concurrentOrders', async () => {
    const orderPromises = [];
    
    for (let i = 0; i < 5; i++) {
      orderPromises.push(processor.createOrder(3000 + i, validItems));
    }
    
    const orders = await Promise.all(orderPromises);
    const uniqueIds = new Set(orders.map(o => o.id));
    
    expect(uniqueIds.size).toBe(5);
  });

  test('invalidOrderHandling', async () => {
    const emptyItems = [];
    
    const order = await processor.createOrder(4001, emptyItems);
    const result = await processor.validateOrder(order.id);
    
    expect(result.isValid).toBe(false);
    expect(result.order.status).toBe(ORDER_STATUS.FAILED);
  });

  test('eventListenerManagement', async () => {
    let eventCount = 0;
    const handler = () => eventCount++;
    
    processor.on('orderCreated', handler);
    processor.on('orderCreated', handler);
    
    await processor.createOrder(5001, validItems);
    
    expect(eventCount).toBe(2);
  });
});

