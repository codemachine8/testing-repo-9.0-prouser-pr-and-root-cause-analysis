/**
 * Order Processor - Handles order lifecycle management
 */

const { UserService } = require('./user-service');
const { CacheManager } = require('./cache-manager');
const config = require('./config-loader');

const ORDER_STATUS = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

class OrderProcessor {
  constructor() {
    this.userService = new UserService();
    this.cache = CacheManager.getInstance();
    this.processingQueue = [];
    this.completedOrders = [];
    this.listeners = [];
  }

  generateOrderId() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createOrder(userId, items) {
    const user = await this.userService.getUser(userId);
    
    if (!user || user.status !== 'active') {
      throw new Error('Invalid user or inactive account');
    }

    const order = {
      id: this.generateOrderId(),
      userId,
      items,
      status: ORDER_STATUS.PENDING,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.processingQueue.push(order);
    this.emit('orderCreated', order);
    
    return order;
  }

  async validateOrder(orderId) {
    const order = this.processingQueue.find(o => o.id === orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Validation rules
    const validations = [
      order.items.length > 0,
      order.total > 0,
      order.items.every(item => item.quantity > 0 && item.price >= 0)
    ];

    const isValid = validations.every(v => v);
    
    order.status = isValid ? ORDER_STATUS.VALIDATED : ORDER_STATUS.FAILED;
    order.updatedAt = new Date();
    order.validatedAt = new Date();

    this.emit('orderValidated', { order, isValid });
    
    return { order, isValid };
  }

  async processOrder(orderId) {
    const order = this.processingQueue.find(o => o.id === orderId);
    
    if (!order || order.status !== ORDER_STATUS.VALIDATED) {
      throw new Error('Order not validated or not found');
    }

    order.status = ORDER_STATUS.PROCESSING;
    order.updatedAt = new Date();

    // Simulate processing time
    const processingTime = config.getConfig().apiTimeout / 10;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    order.status = ORDER_STATUS.COMPLETED;
    order.updatedAt = new Date();
    order.completedAt = new Date();

    // Move to completed
    const idx = this.processingQueue.indexOf(order);
    if (idx > -1) {
      this.processingQueue.splice(idx, 1);
    }
    this.completedOrders.push(order);

    this.emit('orderCompleted', order);
    
    return order;
  }

  async getOrderSummary() {
    const allOrders = [...this.processingQueue, ...this.completedOrders];
    
    return {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === ORDER_STATUS.PENDING).length,
      validated: allOrders.filter(o => o.status === ORDER_STATUS.VALIDATED).length,
      processing: allOrders.filter(o => o.status === ORDER_STATUS.PROCESSING).length,
      completed: allOrders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
      failed: allOrders.filter(o => o.status === ORDER_STATUS.FAILED).length,
      totalRevenue: this.completedOrders.reduce((sum, o) => sum + o.total, 0)
    };
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => l.callback(data));
  }

  reset() {
    this.processingQueue = [];
    this.completedOrders = [];
    this.listeners = [];
  }
}

module.exports = { OrderProcessor, ORDER_STATUS };

