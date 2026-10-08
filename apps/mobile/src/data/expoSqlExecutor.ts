import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import type { SqlExecutor, SqlValue } from "./SqlExecutor";

export const DATABASE_NAME = "free.db";

interface ExpoLike {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params: SqlValue[]): Promise<unknown>;
  getAllAsync<T>(sql: string, params: SqlValue[]): Promise<T[]>;
}

function wrap(db: ExpoLike, transaction: SqlExecutor["transaction"]): SqlExecutor {
  return {
    exec: (sql) => db.execAsync(sql),
    run: async (sql, params = []) => {
      await db.runAsync(sql, [...params]);
    },
    all: (sql, params = []) => db.getAllAsync(sql, [...params]),
    transaction,
  };
}

/** expo-sqlite adapter; transactions use a dedicated exclusive connection. */
export function expoSqlExecutor(db: SQLiteDatabase): SqlExecutor {
  const executor: SqlExecutor = wrap(db, (task) =>
    db.withExclusiveTransactionAsync(async (txn) => {
      await task(
        wrap(txn, () => Promise.reject(new Error("Nested transactions are not supported"))),
      );
    }),
  );
  return executor;
}

export async function openAppDatabase(): Promise<SqlExecutor> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  return expoSqlExecutor(db);
}
