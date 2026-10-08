import type { Journey } from "@free/core";
import type { JourneyRepository } from "../data/JourneyRepository";

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
