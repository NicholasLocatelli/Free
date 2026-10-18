import type { SqlExecutor } from "./SqlExecutor";

/** Non-sensitive preferences (theme, onboarding step…) as string key/value pairs. */
export interface SettingsRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export function createSettingsRepository(db: SqlExecutor): SettingsRepository {
  return {
    async get(key) {
      const [row] = await db.all<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = ?",
        [key],
      );
      return row?.value ?? null;
    },
    async set(key, value) {
      await db.run(
        "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [key, value],
      );
    },
    async remove(key) {
      await db.run("DELETE FROM app_settings WHERE key = ?", [key]);
    },
  };
}
