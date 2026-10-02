import { createJourney, type CreateJourneyInput } from "./journey";
import type { Journey } from "./types";

export const T0 = Date.UTC(2026, 0, 1, 12, 0, 0);

export function makeJourney(overrides: Partial<CreateJourneyInput> = {}): Journey {
  const result = createJourney({
    id: "journey-1",
    periodId: "period-1",
    categoryId: "gambling",
    startedAt: T0,
    now: T0,
    ...overrides,
  });
  if (!result.ok) throw new Error(`fixture failed: ${result.error}`);
  return result.value;
}
