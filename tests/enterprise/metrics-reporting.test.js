/**
 * Metrics Reporting Test Suite
 */

const { getMetricsCollector, resetMetricsCollector } = require('../../src/enterprise/metrics-collector');
const { ReportGenerator } = require('../../src/enterprise/report-generator');
const { CacheManager } = require('../../src/enterprise/cache-manager');
const config = require('../../src/enterprise/config-loader');

describe('MetricsReporting', () => {
  let metrics;
  let reportGen;

  beforeEach(() => {
    metrics = getMetricsCollector();
    reportGen = new ReportGenerator();
  });

  test('counterIncrement', () => {
    metrics.increment('requests');
    metrics.increment('requests');
    metrics.increment('requests', 5);
    
    expect(metrics.getMetric('requests')).toBe(7);
  });

  test('gaugeValue', () => {
    metrics.gauge('activeConnections', 42);
    metrics.gauge('activeConnections', 38);
    
    expect(metrics.getMetric('activeConnections')).toBe(38);
  });

  test('histogramStatistics', () => {
    const latencies = [10, 20, 15, 25, 30, 12, 18, 22, 28, 35];
    latencies.forEach(l => metrics.histogram('responseTime', l));
    
    const stats = metrics.getHistogramStats('responseTime');
    
    expect(stats.count).toBe(10);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(35);
    expect(stats.avg).toBeCloseTo(21.5, 1);
  });

  test('percentileCalculation', () => {
    for (let i = 1; i <= 100; i++) {
      metrics.histogram('latency', i);
    }
    
    const p50 = metrics.calculatePercentile('latency', 50);
    const p95 = metrics.calculatePercentile('latency', 95);
    const p99 = metrics.calculatePercentile('latency', 99);
    
    expect(p50).toBeGreaterThanOrEqual(49);
    expect(p50).toBeLessThanOrEqual(51);
    expect(p95).toBeGreaterThanOrEqual(94);
    expect(p99).toBeGreaterThanOrEqual(98);
  });

  test('uptimeTracking', async () => {
    const initialUptime = metrics.getUptime();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const newUptime = metrics.getUptime();
    expect(newUptime).toBeGreaterThan(initialUptime);
  });

  test('reportGeneration', async () => {
    metrics.increment('pageViews', 1000);
    metrics.gauge('memoryUsage', 512);
    
    const report = metrics.generateReport();
    
    expect(report.counters.pageViews).toBe(1000);
    expect(report.counters.memoryUsage).toBe(512);
    expect(report.timestamp).toBeDefined();
  });

  test('dailyReportCreation', async () => {
    const report = await reportGen.generateDailyReport(new Date());
    
    expect(report.id).toMatch(/^DAILY-/);
    expect(report.type).toBe('daily');
    expect(report.summary).toBeDefined();
  });

  test('reportCaching', async () => {
    const cache = CacheManager.getInstance();
    const today = new Date();
    
    await reportGen.generateDailyReport(today);
    
    const dateStr = today.toISOString().split('T')[0];
    const cached = await cache.get(`report:daily:${dateStr}`);
    
    expect(cached).toBeDefined();
    expect(cached.type).toBe('daily');
  });

  test('weeklyAggregation', async () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weeklyReport = await reportGen.generateWeeklyReport(weekStart);
    
    expect(weeklyReport.type).toBe('weekly');
    expect(weeklyReport.aggregated).toBeDefined();
  });

  test('reportHistory', async () => {
    await reportGen.generateDailyReport(new Date());
    await reportGen.generateDailyReport(new Date(Date.now() - 86400000));
    
    const history = await reportGen.getReportHistory(5);
    
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  test('metricsDisabledConfig', async () => {
    config.setOverride('enableMetrics', false);
    
    const report = metrics.generateReport();
    
    expect(report).toBeNull();
    
    config.clearOverrides();
  });

  test('summaryCalculations', async () => {
    const now = new Date();
    const summary = await reportGen.calculateSummary(now);
    
    expect(summary.percentComplete).toBeGreaterThanOrEqual(0);
    expect(summary.percentComplete).toBeLessThanOrEqual(100);
  });
});

