// TypeScript Test: 4-level deep import chain
// Validates TypeScript import detection and hash calculation
// TS-L1 -> TS-L2 -> TS-L3 -> TS-L4

import { level1CoreTS, level1HelperTS, Level1Config } from '../../src/ts-level1/core';
import { Level2Processor } from '../../src/ts-level2/middleware';
import { level3AsyncService } from '../../src/ts-level3/service';
import { DatabaseConnection, DBConfig } from '../../src/ts-level4/database';

describe('TypeScript Deep Import Chain (4 Levels)', () => {
  test('test_ts_4_level_import_chain', () => {
    // Tests: TS-L1 -> TS-L2 -> TS-L3 -> TS-L4
    const result = level1CoreTS();
    expect(result).toContain('TS-L4:database');
    expect(result).toContain('TS-L1:core');
  });

  test('test_ts_interface_import', () => {
    // Tests that TypeScript interfaces are handled correctly
    const config: Level1Config = {
      name: 'test',
      version: 1
    };
    expect(config.name).toBe('test');
    expect(config.version).toBe(1);
  });

  test('test_ts_class_import', () => {
    // Tests TypeScript class imports
    const processor = new Level2Processor();
    const result = processor.process('test-data');
    expect(result).toContain('Processed: test-data');
  });

  test('test_ts_async_flaky', async () => {
    // Flaky async test with TypeScript imports
    try {
      const result = await level3AsyncService();
      expect(result).toBe('TS-L3:async-service');
    } catch (error: any) {
      expect(error.message).toContain('Async service failed');
    }
  });

  test('test_ts_database_connection_flaky', () => {
    // Flaky: Database connection fails 25% of time
    const db = new DatabaseConnection();
    try {
      db.connect();
      expect(db.isConnected()).toBe(true);
    } catch (error: any) {
      expect(error.message).toContain('connection failed');
    }
  });

  test('test_ts_multiple_imports', () => {
    // Tests multiple TypeScript imports
    const helper = level1HelperTS();
    const processor = new Level2Processor();
    const db = new DatabaseConnection();

    expect(helper).toBe('TS-L1:helper');
    expect(processor).toBeInstanceOf(Level2Processor);
    expect(db).toBeInstanceOf(DatabaseConnection);
  });

  test('test_ts_type_annotations', () => {
    // Tests that type annotations don't break import detection
    const config: DBConfig = {
      host: 'localhost',
      port: 5432,
      database: 'test_db'
    };

    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
  });
});
