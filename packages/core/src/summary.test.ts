import { describe, expect, it } from "vitest";
import { currentPeriodView, journeyStats } from "./summary";
import { makeJourney, T0 } from "./test-helpers";
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_WEEK } from "./time";

describe("currentPeriodView", () => {
  it("recomputes elapsed time from the stored start (survives restarts)", () => {
    const journey = makeJourney();
    const now = T0 + 2 * MS_PER_DAY + 3 * MS_PER_HOUR;
    const view = currentPeriodView(journey, now);
    expect(view?.parts).toMatchObject({ days: 2, hours: 3 });
    expect(view?.milestones.reached).toEqual([24]);
    expect(view?.money.status).toBe("disabled");
  });

  it("flags clock skew instead of showing negative time", () => {
    const view = currentPeriodView(makeJourney(), T0 - MS_PER_HOUR);
    expect(view).toMatchObject({ elapsedMs: 0, clockSkew: true });
  });

  it("includes the money estimate when enabled", () => {
    const journey = makeJourney({
      money: {
        enabled: true,
        currency: "EUR",
        amountPerSessionMinor: 2_000,
        sessionsPerUnit: 1,
        frequencyUnit: "week",
      },
    });
    expect(currentPeriodView(journey, T0 + MS_PER_WEEK)?.money).toEqual({
      status: "estimated",
      amountMinor: 2_000,
      currency: "EUR",
    });
  });
});

describe("journeyStats", () => {
  it("handles a brand-new journey", () => {
    expect(journeyStats(makeJourney(), T0)).toMatchObject({
      periodsCount: 1,
      relapsesCount: 0,
      longestPeriodMs: 0,
      totalTimeMs: 0,
      urgesCount: 0,
      achievedMilestones: [],
    });
  });
});
