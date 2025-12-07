/**
 * Data Processing Test Suite
 */

const { DataPipeline } = require('../../src/enterprise/data-pipeline');
const config = require('../../src/enterprise/config-loader');

describe('DataProcessing', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = new DataPipeline();
  });

  test('basicTransformation', async () => {
    pipeline.addTransformer('uppercase', (record) => ({
      ...record,
      name: record.name.toUpperCase()
    }));

    const result = await pipeline.transform({ id: 1, name: 'test' });
    
    expect(result.name).toBe('TEST');
  });

  test('chainedTransformers', async () => {
    pipeline
      .addTransformer('trim', (r) => ({ ...r, value: r.value.trim() }))
      .addTransformer('parse', (r) => ({ ...r, parsed: parseFloat(r.value) }))
      .addTransformer('round', (r) => ({ ...r, rounded: Math.round(r.parsed) }));

    const result = await pipeline.transform({ value: '  42.7  ' });
    
    expect(result.rounded).toBe(43);
  });

  test('validationRules', async () => {
    pipeline.addValidator('required', (r) => ({
      valid: r.id !== undefined,
      reason: 'ID is required'
    }));

    pipeline.addValidator('positive', (r) => ({
      valid: r.amount > 0,
      reason: 'Amount must be positive'
    }));

    const valid = await pipeline.validate({ id: 1, amount: 100 });
    expect(valid.valid).toBe(true);

    const invalid = await pipeline.validate({ id: 1, amount: -5 });
    expect(invalid.valid).toBe(false);
  });

  test('batchProcessing', async () => {
    pipeline
      .addValidator('hasValue', (r) => ({ valid: r.value !== undefined }))
      .addTransformer('double', (r) => ({ ...r, doubled: r.value * 2 }));

    const records = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      value: i + 1
    }));

    const result = await pipeline.process(records);
    
    expect(result.successful.length).toBe(50);
    expect(result.failed.length).toBe(0);
    expect(result.stats.processed).toBe(50);
  });

  test('partialFailureHandling', async () => {
    pipeline.addTransformer('divide', (r) => {
      if (r.divisor === 0) throw new Error('Division by zero');
      return { ...r, result: r.value / r.divisor };
    });

    const records = [
      { value: 10, divisor: 2 },
      { value: 20, divisor: 0 },
      { value: 30, divisor: 3 }
    ];

    const result = await pipeline.process(records);
    
    expect(result.successful.length).toBe(2);
    expect(result.failed.length).toBe(1);
  });

  test('throughputMetrics', async () => {
    pipeline.addTransformer('identity', (r) => r);

    const records = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    
    const result = await pipeline.process(records);
    
    expect(result.stats.durationMs).toBeGreaterThan(0);
    expect(result.stats.throughput).toBeGreaterThan(0);
  });

  test('configuredBatchSize', async () => {
    const settings = config.getConfig();
    pipeline.addTransformer('noop', (r) => r);

    const records = Array.from({ length: settings.batchSize + 10 }, (_, i) => ({ id: i }));
    
    const result = await pipeline.process(records);
    
    expect(result.successful.length).toBe(settings.batchSize + 10);
  });

  test('emptyInputHandling', async () => {
    const result = await pipeline.process([]);
    
    expect(result.successful.length).toBe(0);
    expect(result.failed.length).toBe(0);
    expect(result.stats.processed).toBe(0);
  });

  test('complexTransformation', async () => {
    pipeline
      .addValidator('schema', (r) => ({
        valid: r.type && r.data,
        reason: 'Invalid schema'
      }))
      .addTransformer('enrich', async (r) => {
        await new Promise(resolve => setTimeout(resolve, 1));
        return {
          ...r,
          enrichedAt: Date.now(),
          checksum: r.data.length
        };
      });

    const records = [
      { type: 'A', data: 'hello' },
      { type: 'B', data: 'world' }
    ];

    const result = await pipeline.process(records);
    
    expect(result.successful.length).toBe(2);
    expect(result.successful[0].transformed.checksum).toBe(5);
  });
});

