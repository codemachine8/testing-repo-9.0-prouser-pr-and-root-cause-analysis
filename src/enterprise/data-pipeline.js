/**
 * Data Pipeline - ETL operations for data processing
 */

const config = require('./config-loader');

class DataPipeline {
  constructor(options = {}) {
    this.transformers = [];
    this.validators = [];
    this.processed = 0;
    this.errors = [];
    this.startTime = null;
    this.endTime = null;
  }

  addTransformer(name, fn) {
    this.transformers.push({ name, fn });
    return this;
  }

  addValidator(name, fn) {
    this.validators.push({ name, fn });
    return this;
  }

  async validate(record) {
    for (const { name, fn } of this.validators) {
      const result = await fn(record);
      if (!result.valid) {
        return { valid: false, validator: name, reason: result.reason };
      }
    }
    return { valid: true };
  }

  async transform(record) {
    let current = { ...record };
    
    for (const { name, fn } of this.transformers) {
      current = await fn(current);
    }
    
    return current;
  }

  async process(records) {
    this.startTime = Date.now();
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    const batchSize = config.getConfig().batchSize;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (record) => {
          try {
            const validation = await this.validate(record);
            
            if (!validation.valid) {
              return { status: 'skipped', record, reason: validation.reason };
            }

            const transformed = await this.transform(record);
            this.processed++;
            
            return { status: 'success', original: record, transformed };
          } catch (error) {
            this.errors.push({ record, error: error.message });
            return { status: 'failed', record, error: error.message };
          }
        })
      );

      batchResults.forEach(result => {
        if (result.status === 'success') {
          results.successful.push(result);
        } else if (result.status === 'failed') {
          results.failed.push(result);
        } else {
          results.skipped.push(result);
        }
      });
    }

    this.endTime = Date.now();
    
    return {
      ...results,
      stats: this.getStats()
    };
  }

  getStats() {
    const duration = this.endTime && this.startTime 
      ? this.endTime - this.startTime 
      : null;
    
    return {
      processed: this.processed,
      errors: this.errors.length,
      durationMs: duration,
      throughput: duration ? (this.processed / duration) * 1000 : null
    };
  }

  reset() {
    this.processed = 0;
    this.errors = [];
    this.startTime = null;
    this.endTime = null;
  }
}

module.exports = { DataPipeline };

