// TypeScript Level 1
import { level2Middleware } from '../ts-level2/middleware';

export function level1CoreTS(): string {
  return level2Middleware() + ' -> TS-L1:core';
}

export function level1HelperTS(): string {
  return 'TS-L1:helper';
}

export interface Level1Config {
  name: string;
  version: number;
}
