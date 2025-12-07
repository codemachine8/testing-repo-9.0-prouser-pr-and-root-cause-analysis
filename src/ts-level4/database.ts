// TypeScript Level 4 (deepest)
export function level4Database(): string {
  return 'TS-L4:database';
}

export class DatabaseConnection {
  private connected: boolean = false;

  connect(): void {
    // Flaky connection
    if (Math.random() < 0.25) {
      throw new Error('TS Database connection failed');
    }
    this.connected = true;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export interface DBConfig {
  host: string;
  port: number;
  database: string;
}
