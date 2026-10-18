import type { Journey } from "@free/core";
import type { JourneyRepository } from "../data/JourneyRepository";
import type { SettingsRepository } from "../data/SettingsRepository";

/** In-memory repository for component tests (SQL behaviour is covered in src/data). */
export function createMemoryRepository(initial: Journey | null = null): JourneyRepository {
  let stored = initial;
  return {
    load: () => Promise.resolve(stored),
    save: (next) => {
      stored = next;
      return Promise.resolve();
    },
    deleteAll: () => {
      stored = null;
      return Promise.resolve();
    },
  };
}

export function createMemorySettings(initial: Record<string, string> = {}): SettingsRepository & {
  values: Map<string, string>;
} {
  const values = new Map(Object.entries(initial));
  return {
    values,
    get: (key) => Promise.resolve(values.get(key) ?? null),
    set: (key, value) => {
      values.set(key, value);
      return Promise.resolve();
    },
    remove: (key) => {
      values.delete(key);
      return Promise.resolve();
    },
  };
}
