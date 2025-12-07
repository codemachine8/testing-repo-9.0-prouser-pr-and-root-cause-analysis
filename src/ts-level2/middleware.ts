// TypeScript Level 2
import { level3Service } from '../ts-level3/service';

export function level2Middleware(): string {
  return level3Service() + ' -> TS-L2:middleware';
}

export class Level2Processor {
  process(data: string): string {
    return `Processed: ${data}`;
  }
}
