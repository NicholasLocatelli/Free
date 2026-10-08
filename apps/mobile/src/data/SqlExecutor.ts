export type SqlValue = string | number | null;

/**
 * Minimal SQL surface the repository needs. Implemented by expo-sqlite on device and by
 * node:sqlite in tests, so migrations and queries run against real SQLite in CI.
 */
export interface SqlExecutor {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: readonly SqlValue[]): Promise<void>;
  all<T>(sql: string, params?: readonly SqlValue[]): Promise<T[]>;
  /** Runs `task` atomically: any thrown error rolls back every statement it issued. */
  transaction(task: (tx: SqlExecutor) => Promise<void>): Promise<void>;
}
