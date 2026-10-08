import { randomUUID } from "expo-crypto";
import { createLazyDatabase, createLazyJourneyRepository } from "../data/appDatabase";
import { openAppDatabase } from "../data/expoSqlExecutor";
import { createJourneyStore, type JourneyStore } from "./journeyStore";

export function createAppStore(): JourneyStore {
  const repository = createLazyJourneyRepository(createLazyDatabase(openAppDatabase));
  return createJourneyStore({ repository, now: Date.now, newId: randomUUID });
}
