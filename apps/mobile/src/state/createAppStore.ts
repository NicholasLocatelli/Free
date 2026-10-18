import { randomUUID } from "expo-crypto";
import {
  createLazyDatabase,
  createLazyJourneyRepository,
  createLazySettingsRepository,
} from "../data/appDatabase";
import { openAppDatabase } from "../data/expoSqlExecutor";
import type { SettingsRepository } from "../data/SettingsRepository";
import { createJourneyStore, type JourneyStore } from "./journeyStore";

export interface AppServices {
  journeyStore: JourneyStore;
  settings: SettingsRepository;
}

/** One database connection shared by the journey store and the settings repository. */
export function createAppServices(): AppServices {
  const getDb = createLazyDatabase(openAppDatabase);
  return {
    journeyStore: createJourneyStore({
      repository: createLazyJourneyRepository(getDb),
      now: Date.now,
      newId: randomUUID,
    }),
    settings: createLazySettingsRepository(getDb),
  };
}
