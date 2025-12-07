// TypeScript Level 3
import { level4Database } from '../ts-level4/database';

export function level3Service(): string {
  return level4Database() + ' -> TS-L3:service';
}

export async function level3AsyncService(): Promise<string> {
  // Flaky async operation
  if (Math.random() < 0.3) {
    throw new Error('TS Async service failed');
  }
  return 'TS-L3:async-service';
}
