import { createJourneyRepository, type JourneyRepository } from "./JourneyRepository";
import { migrate } from "./migrations";
import { createSettingsRepository, type SettingsRepository } from "./SettingsRepository";
import type { SqlExecutor } from "./SqlExecutor";

/**
 * Lazily opens and migrates the database. A failed open is not cached, so "Riprova" in
 * the error state really retries instead of replaying the same rejection.
 */
export function createLazyDatabase(open: () => Promise<SqlExecutor>) {
  let pending: Promise<SqlExecutor> | null = null;
  return (): Promise<SqlExecutor> => {
    pending ??= open()
      .then(async (db) => {
        await migrate(db);
        return db;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
    return pending;
  };
}

export function createLazyJourneyRepository(getDb: () => Promise<SqlExecutor>): JourneyRepository {
  const repository = async () => createJourneyRepository(await getDb());
  return {
    load: async () => (await repository()).load(),
    save: async (next, previous) => (await repository()).save(next, previous),
    deleteAll: async () => (await repository()).deleteAll(),
  };
}

export function createLazySettingsRepository(
  getDb: () => Promise<SqlExecutor>,
): SettingsRepository {
  const repository = async () => createSettingsRepository(await getDb());
  return {
    get: async (key) => (await repository()).get(key),
    set: async (key, value) => (await repository()).set(key, value),
    remove: async (key) => (await repository()).remove(key),
  };
}
