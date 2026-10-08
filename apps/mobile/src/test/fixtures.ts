import { createJourney, MS_PER_DAY, type Journey } from "@free/core";

export const T0 = Date.UTC(2026, 9, 1, 20, 0);
export const DAY = MS_PER_DAY;

export function newJourney(): Journey {
  const result = createJourney({
    id: "journey-1",
    periodId: "period-1",
    categoryId: "gambling",
    startedAt: T0,
    now: T0,
    money: {
      enabled: true,
      currency: "EUR",
      amountPerSessionMinor: 5_000,
      sessionsPerUnit: 2,
      frequencyUnit: "week",
    },
  });
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

/** Sequential ids so tests can assert on them. */
export function idSequence(prefix = "id") {
  let n = 0;
  return () => `${prefix}-${++n}`;
}
