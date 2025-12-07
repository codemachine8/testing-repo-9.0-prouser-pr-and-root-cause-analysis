/**
 * Report Generator - Creates various business reports
 */

const { getMetricsCollector } = require('./metrics-collector');
const { CacheManager } = require('./cache-manager');
const config = require('./config-loader');

class ReportGenerator {
  constructor() {
    this.cache = CacheManager.getInstance();
    this.generatedReports = [];
  }

  async generateDailyReport(date = new Date()) {
    const metrics = getMetricsCollector();
    const dateStr = date.toISOString().split('T')[0];
    
    const report = {
      id: `DAILY-${dateStr}-${Date.now()}`,
      type: 'daily',
      date: dateStr,
      generatedAt: new Date(),
      metrics: metrics.generateReport(),
      summary: await this.calculateSummary(date)
    };

    this.generatedReports.push(report);
    await this.cache.set(`report:daily:${dateStr}`, report, 86400000);
    
    return report;
  }

  async calculateSummary(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Calculate time boundaries
    const elapsed = Date.now() - dayStart.getTime();
    const totalDayMs = dayEnd.getTime() - dayStart.getTime();
    const percentComplete = Math.min((elapsed / totalDayMs) * 100, 100);

    return {
      dayStart: dayStart.toISOString(),
      dayEnd: dayEnd.toISOString(),
      percentComplete,
      isComplete: percentComplete >= 100
    };
  }

  async generateWeeklyReport(weekStart) {
    const reports = [];
    const startDate = new Date(weekStart);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const cached = await this.cache.get(`report:daily:${date.toISOString().split('T')[0]}`);
      if (cached) {
        reports.push(cached);
      }
    }

    return {
      id: `WEEKLY-${startDate.toISOString().split('T')[0]}`,
      type: 'weekly',
      weekStart: startDate.toISOString(),
      generatedAt: new Date(),
      dailyReports: reports,
      aggregated: this.aggregateReports(reports)
    };
  }

  aggregateReports(reports) {
    if (reports.length === 0) {
      return null;
    }

    return {
      totalDays: reports.length,
      coveragePercent: (reports.length / 7) * 100
    };
  }

  async getReportHistory(limit = 10) {
    return this.generatedReports.slice(-limit);
  }

  reset() {
    this.generatedReports = [];
  }
}

module.exports = { ReportGenerator };

