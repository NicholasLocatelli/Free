import { describe, expect, it } from "vitest";
import {
  createJourney,
  currentPeriod,
  editCurrentPeriodStart,
  MAX_NOTE_LENGTH,
  recordRelapse,
  recordUrge,
  updateMilestones,
  updateMoneySettings,
  type RecordRelapseInput,
  type RecordUrgeInput,
} from "./journey";
import type { Result } from "./result";
import { journeyStats } from "./summary";
import { makeJourney, T0 } from "./test-helpers";
import { MS_PER_DAY, MS_PER_HOUR } from "./time";
import type { Journey } from "./types";

function unwrap(result: Result<Journey, string>): Journey {
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

const relapseInput = (overrides: Partial<RecordRelapseInput> = {}): RecordRelapseInput => ({
  relapseId: "relapse-1",
  newPeriodId: "period-2",
  occurredAt: T0 + 10 * MS_PER_DAY,
  now: T0 + 10 * MS_PER_DAY,
  ...overrides,
});

const urgeInput = (overrides: Partial<RecordUrgeInput> = {}): RecordUrgeInput => ({
  id: "urge-1",
  occurredAt: T0 + MS_PER_HOUR,
  intensity: 8,
  trigger: "boredom",
  durationMinutes: 15,
  outcome: "resisted",
  now: T0 + 2 * MS_PER_HOUR,
  ...overrides,
});

describe("createJourney", () => {
  it("opens a first period at the chosen start", () => {
    const journey = makeJourney({ startedAt: T0 - MS_PER_DAY });
    expect(currentPeriod(journey)).toMatchObject({ id: "period-1", startedAt: T0 - MS_PER_DAY });
    expect(journey.milestoneHours[0]).toBe(24);
    expect(journey.money.enabled).toBe(false);
  });

  it("rejects a start in the future", () => {
    expect(
      createJourney({ id: "j", periodId: "p", categoryId: "gambling", startedAt: T0 + 1, now: T0 }),
    ).toEqual({ ok: false, error: "in_future" });
  });

  it("rejects categories that are not available yet", () => {
    expect(
      createJourney({ id: "j", periodId: "p", categoryId: "alcohol", startedAt: T0, now: T0 }),
    ).toEqual({ ok: false, error: "category_unavailable" });
  });

  it.each([Number.NaN, -1, 1.5])("rejects invalid start instant %s", (startedAt) => {
    expect(
      createJourney({ id: "j", periodId: "p", categoryId: "gambling", startedAt, now: T0 }),
    ).toEqual({ ok: false, error: "invalid_instant" });
  });
});

describe("recordRelapse", () => {
  it("closes the current period and opens a new one", () => {
    const journey = unwrap(recordRelapse(makeJourney(), relapseInput({ note: "  stress  " })));
    expect(journey.periods).toEqual([
      { id: "period-1", startedAt: T0, endedAt: T0 + 10 * MS_PER_DAY, endReason: "relapse" },
      { id: "period-2", startedAt: T0 + 10 * MS_PER_DAY, endedAt: null, endReason: null },
    ]);
    expect(journey.relapses[0]).toMatchObject({ periodId: "period-1", note: "stress" });
  });

  it("preserves history, urges and milestones from earlier periods", () => {
    const withUrge = unwrap(recordUrge(makeJourney(), urgeInput()));
    const journey = unwrap(recordRelapse(withUrge, relapseInput()));
    const stats = journeyStats(journey, T0 + 11 * MS_PER_DAY);

    expect(journey.urges).toHaveLength(1);
    expect(stats.totalTimeMs).toBe(11 * MS_PER_DAY);
    expect(stats.longestPeriodMs).toBe(10 * MS_PER_DAY);
    expect(
      stats.achievedMilestones.filter((m) => m.periodId === "period-1").map((m) => m.hours),
    ).toEqual([24, 72, 168]);
  });

  it("supports a later restart and keeps the gap out of both periods", () => {
    const journey = unwrap(
      recordRelapse(
        makeJourney(),
        relapseInput({ restartAt: T0 + 11 * MS_PER_DAY, now: T0 + 12 * MS_PER_DAY }),
      ),
    );
    expect(currentPeriod(journey)?.startedAt).toBe(T0 + 11 * MS_PER_DAY);
  });

  it("rejects a double submit with the same id", () => {
    const once = unwrap(recordRelapse(makeJourney(), relapseInput()));
    expect(recordRelapse(once, relapseInput({ newPeriodId: "period-3" }))).toEqual({
      ok: false,
      error: "duplicate_id",
    });
  });

  it.each([
    [{ occurredAt: T0 - 1 }, "before_period_start"],
    [{ occurredAt: T0 + 20 * MS_PER_DAY }, "in_future"],
    [{ restartAt: T0 + 9 * MS_PER_DAY }, "restart_before_relapse"],
    [{ restartAt: T0 + 20 * MS_PER_DAY }, "in_future"],
    [{ note: "x".repeat(MAX_NOTE_LENGTH + 1) }, "note_too_long"],
    [{ contributingFactors: [""] }, "invalid_tags"],
  ] as const)("rejects %o with %s", (patch, error) => {
    expect(recordRelapse(makeJourney(), relapseInput(patch))).toEqual({ ok: false, error });
  });

  it("does not mutate the original journey", () => {
    const original = makeJourney();
    recordRelapse(original, relapseInput());
    expect(original).toEqual(makeJourney());
  });
});

describe("recordUrge", () => {
  it("stores the urge and updates statistics", () => {
    const journey = unwrap(recordUrge(makeJourney(), urgeInput()));
    expect(journey.urges[0]).toMatchObject({
      intensity: 8,
      trigger: "boredom",
      outcome: "resisted",
    });
    expect(journeyStats(journey, T0 + MS_PER_DAY)).toMatchObject({
      urgesCount: 1,
      urgesResistedCount: 1,
    });
  });

  it("does not close the period when the user acted on the urge", () => {
    const journey = unwrap(recordUrge(makeJourney(), urgeInput({ outcome: "acted" })));
    expect(currentPeriod(journey)?.id).toBe("period-1");
  });

  it.each([1, 10])("accepts boundary intensity %s", (intensity) => {
    expect(recordUrge(makeJourney(), urgeInput({ intensity })).ok).toBe(true);
  });

  it.each([
    [{ intensity: 0 }, "invalid_intensity"],
    [{ intensity: 11 }, "invalid_intensity"],
    [{ intensity: 5.5 }, "invalid_intensity"],
    [{ durationMinutes: -1 }, "invalid_duration"],
    [{ durationMinutes: 24 * 60 + 1 }, "invalid_duration"],
    [{ occurredAt: T0 + 3 * MS_PER_HOUR }, "in_future"],
    [{ trigger: "x".repeat(41) }, "invalid_tags"],
  ] as const)("rejects %o with %s", (patch, error) => {
    expect(recordUrge(makeJourney(), urgeInput(patch))).toEqual({ ok: false, error });
  });

  it("rejects duplicates", () => {
    const once = unwrap(recordUrge(makeJourney(), urgeInput()));
    expect(recordUrge(once, urgeInput())).toEqual({ ok: false, error: "duplicate_id" });
  });
});

describe("editCurrentPeriodStart", () => {
  it("corrects the start of the open period", () => {
    const journey = unwrap(editCurrentPeriodStart(makeJourney(), T0 - MS_PER_DAY, T0));
    expect(currentPeriod(journey)?.startedAt).toBe(T0 - MS_PER_DAY);
  });

  it("cannot overlap the previous period", () => {
    const relapsed = unwrap(recordRelapse(makeJourney(), relapseInput()));
    expect(editCurrentPeriodStart(relapsed, T0 + MS_PER_DAY, T0 + 10 * MS_PER_DAY)).toEqual({
      ok: false,
      error: "before_previous_period",
    });
  });
});

describe("settings", () => {
  it("updates milestones and money with validation", () => {
    const journey = makeJourney();
    expect(unwrap(updateMilestones(journey, [48, 12])).milestoneHours).toEqual([12, 48]);
    expect(updateMilestones(journey, [])).toEqual({ ok: false, error: "invalid_milestones" });
    expect(updateMoneySettings(journey, { ...journey.money, enabled: true })).toEqual({
      ok: false,
      error: "invalid_money_settings",
    });
  });
});

describe("optional fields and missing open period", () => {
  it("stores an urge with only the required fields", () => {
    const journey = unwrap(
      recordUrge(makeJourney(), {
        id: "u",
        occurredAt: T0,
        intensity: 3,
        outcome: "acted",
        now: T0,
      }),
    );
    expect(journey.urges[0]).toMatchObject({
      trigger: null,
      durationMinutes: null,
      copingActions: [],
      note: null,
    });
  });

  it("normalises blank notes to null", () => {
    const journey = unwrap(recordRelapse(makeJourney(), relapseInput({ note: "   " })));
    expect(journey.relapses[0]?.note).toBeNull();
  });

  it("rejects commands that need an open period when none exists", () => {
    const journey = makeJourney();
    const closed = {
      ...journey,
      periods: journey.periods.map((p) => ({ ...p, endedAt: T0, endReason: "relapse" as const })),
    };
    expect(recordRelapse(closed, relapseInput())).toEqual({ ok: false, error: "no_open_period" });
    expect(editCurrentPeriodStart(closed, T0, T0)).toEqual({ ok: false, error: "no_open_period" });
  });

  it("rejects invalid instants and future edits", () => {
    expect(editCurrentPeriodStart(makeJourney(), T0 + 1, T0)).toEqual({
      ok: false,
      error: "in_future",
    });
    expect(recordUrge(makeJourney(), urgeInput({ occurredAt: Number.NaN }))).toEqual({
      ok: false,
      error: "invalid_instant",
    });
  });

  it("validates milestones and money at creation", () => {
    const base = {
      id: "j",
      periodId: "p",
      categoryId: "gambling" as const,
      startedAt: T0,
      now: T0,
    };
    expect(createJourney({ ...base, milestoneHours: [] })).toEqual({
      ok: false,
      error: "invalid_milestones",
    });
    expect(
      createJourney({
        ...base,
        money: {
          enabled: true,
          currency: "EUR",
          amountPerSessionMinor: null,
          sessionsPerUnit: null,
          frequencyUnit: "week",
        },
      }),
    ).toEqual({ ok: false, error: "invalid_money_settings" });
  });

  it("accepts valid money settings updates", () => {
    const money = {
      enabled: true,
      currency: "EUR",
      amountPerSessionMinor: 1_000,
      sessionsPerUnit: 1,
      frequencyUnit: "day" as const,
    };
    expect(unwrap(updateMoneySettings(makeJourney(), money)).money).toEqual(money);
  });
});
