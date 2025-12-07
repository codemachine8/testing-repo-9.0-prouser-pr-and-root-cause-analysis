/**
 * Notification Hub - Manages notification delivery
 */

const EventEmitter = require('events');
const config = require('./config-loader');

class NotificationHub extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.sent = [];
    this.failed = [];
    this.channels = new Map();
    this.isProcessing = false;
    this.batchSize = 10;
  }

  registerChannel(name, handler) {
    this.channels.set(name, handler);
  }

  async send(notification) {
    const enriched = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ...notification,
      queuedAt: new Date(),
      status: 'queued',
      attempts: 0
    };

    this.queue.push(enriched);
    this.emit('queued', enriched);

    return enriched;
  }

  async processBatch() {
    if (this.isProcessing || this.queue.length === 0) {
      return { processed: 0 };
    }

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);
    const results = [];

    for (const notification of batch) {
      try {
        notification.attempts++;
        notification.status = 'sending';

        const handler = this.channels.get(notification.channel);
        if (!handler) {
          throw new Error(`Unknown channel: ${notification.channel}`);
        }

        await handler(notification);
        
        notification.status = 'sent';
        notification.sentAt = new Date();
        this.sent.push(notification);
        results.push({ id: notification.id, success: true });
        this.emit('sent', notification);
      } catch (error) {
        notification.status = 'failed';
        notification.error = error.message;
        this.failed.push(notification);
        results.push({ id: notification.id, success: false, error: error.message });
        this.emit('failed', notification);
      }
    }

    this.isProcessing = false;
    return { processed: results.length, results };
  }

  async processAll() {
    const allResults = [];
    while (this.queue.length > 0) {
      const { results } = await this.processBatch();
      if (results) allResults.push(...results);
    }
    return allResults;
  }

  getStats() {
    return {
      queued: this.queue.length,
      sent: this.sent.length,
      failed: this.failed.length,
      successRate: this.sent.length / Math.max(this.sent.length + this.failed.length, 1),
      channels: Array.from(this.channels.keys())
    };
  }

  getNotificationById(id) {
    return [...this.queue, ...this.sent, ...this.failed].find(n => n.id === id);
  }

  reset() {
    this.queue = [];
    this.sent = [];
    this.failed = [];
    this.isProcessing = false;
    this.removeAllListeners();
  }
}

// Singleton
let instance = null;

function getNotificationHub() {
  if (!instance) {
    instance = new NotificationHub();
  }
  return instance;
}

function resetNotificationHub() {
  if (instance) {
    instance.reset();
  }
  instance = null;
}

module.exports = { NotificationHub, getNotificationHub, resetNotificationHub };

