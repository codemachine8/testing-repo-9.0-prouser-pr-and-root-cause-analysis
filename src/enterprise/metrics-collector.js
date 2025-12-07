/**
 * Metrics Collector - Aggregates and reports system metrics
 */

const config = require('./config-loader');

class MetricsCollector {
  constructor() {
    this.metrics = new Map();
    this.histograms = new Map();
    this.startTime = Date.now();
  }

  increment(name, value = 1) {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  gauge(name, value) {
    this.metrics.set(name, value);
  }

  histogram(name, value) {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    this.histograms.get(name).push(value);
  }

  getMetric(name) {
    return this.metrics.get(name);
  }

  getHistogramStats(name) {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      count: sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  calculatePercentile(name, percentile) {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * percentile / 100);
    return sorted[idx];
  }

  getUptime() {
    return Date.now() - this.startTime;
  }

  generateReport() {
    const settings = config.getConfig();
    
    if (!settings.enableMetrics) {
      return null;
    }

    const report = {
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      counters: Object.fromEntries(this.metrics),
      histograms: {}
    };

    for (const [name] of this.histograms) {
      report.histograms[name] = this.getHistogramStats(name);
    }

    return report;
  }

  reset() {
    this.metrics.clear();
    this.histograms.clear();
    this.startTime = Date.now();
  }
}

// Singleton
let instance = null;

function getMetricsCollector() {
  if (!instance) {
    instance = new MetricsCollector();
  }
  return instance;
}

function resetMetricsCollector() {
  if (instance) {
    instance.reset();
  }
  instance = null;
}

module.exports = { MetricsCollector, getMetricsCollector, resetMetricsCollector };

