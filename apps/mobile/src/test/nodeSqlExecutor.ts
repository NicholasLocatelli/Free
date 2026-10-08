import { DatabaseSync } from "node:sqlite";
import type { SqlExecutor, SqlValue } from "../data/SqlExecutor";

/** SQLite errors become rejections, as with expo-sqlite. */
function attempt<T>(fn: () => T): Promise<T> {
  try {
    return Promise.resolve(fn());
  } catch (error) {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
}

/** node:sqlite adapter used by integration tests: same SQL engine as on device. */
export function createNodeSqlExecutor(path = ":memory:"): SqlExecutor & { close(): void } {
  const db = new DatabaseSync(path);
  let depth = 0;

  const executor: SqlExecutor & { close(): void } = {
    exec: (sql) =>
      attempt(() => {
        db.exec(sql);
      }),
    run: (sql, params: readonly SqlValue[] = []) =>
      attempt(() => {
        db.prepare(sql).run(...params);
      }),
    all: <T>(sql: string, params: readonly SqlValue[] = []) =>
      attempt(() => db.prepare(sql).all(...params) as T[]),
    async transaction(task) {
      if (depth > 0) throw new Error("Nested transactions are not supported");
      depth++;
      db.exec("BEGIN IMMEDIATE");
      try {
        await task(executor);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      } finally {
        depth--;
      }
    },
    close: () => {
      db.close();
    },
  };
  return executor;
}
