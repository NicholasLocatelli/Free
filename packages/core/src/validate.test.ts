import { describe, expect, it } from "vitest";
import { recordRelapse, recordUrge } from "./journey";
import { makeJourney, T0 } from "./test-helpers";
import { MS_PER_DAY } from "./time";
import type { Journey } from "./types";
import { parseJourney } from "./validate";

function unwrap(r: { ok: true; value: Journey } | { ok: false; error: string }): Journey {
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

function fullJourney(): Journey {
  const urged = unwrap(
    recordUrge(makeJourney(), {
      id: "u1",
      occurredAt: T0 + 1,
      intensity: 7,
      trigger: "stress",
      durationMinutes: 10,
      copingActions: ["breathing"],
      outcome: "resisted",
      note: "ok",
      now: T0 + 1,
    }),
  );
  return unwrap(
    recordRelapse(urged, {
      relapseId: "r1",
      newPeriodId: "p2",
      occurredAt: T0 + MS_PER_DAY,
      contributingFactors: ["boredom"],
      note: null,
      now: T0 + MS_PER_DAY,
    }),
  );
}

/** JSON round trip, as for a real backup file. */
const viaJson = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe("parseJourney", () => {
  it("accepts a valid journey after a JSON round trip", () => {
    const journey = fullJourney();
    expect(parseJourney(viaJson(journey))).toEqual({ ok: true, value: journey });
  });

  it("accepts backups written before retained milestones existed (#19)", () => {
    const journey = fullJourney();
    const legacy = viaJson({
      ...journey,
      periods: journey.periods.map((p) => {
        const { retainedMilestoneHours, ...legacy } = p;
        expect(retainedMilestoneHours).toEqual([]);
        return legacy;
      }),
    });
    expect(parseJourney(legacy)).toEqual({ ok: true, value: journey });
  });

  it("normalizes retained milestones", () => {
    const journey = fullJourney();
    const input = viaJson({
      ...journey,
      periods: journey.periods.map((p, i) =>
        i === 0 ? { ...p, retainedMilestoneHours: [72, 24, 72] } : p,
      ),
    });
    const parsed = parseJourney(input);
    expect(parsed.ok && parsed.value.periods[0]?.retainedMilestoneHours).toEqual([24, 72]);
  });

  it.each([
    ["not an object", () => "x"],
    ["unknown category", (j: Journey) => ({ ...j, categoryId: "poker" })],
    ["no periods", (j: Journey) => ({ ...j, periods: [] })],
    [
      "two open periods",
      (j: Journey) => ({
        ...j,
        periods: j.periods.map((p) => ({ ...p, endedAt: null, endReason: null })),
      }),
    ],
    [
      "overlapping periods",
      (j: Journey) => ({ ...j, periods: [j.periods[0], { ...j.periods[1], startedAt: T0 }] }),
    ],
    [
      "end before start",
      (j: Journey) => ({ ...j, periods: [{ ...j.periods[0], endedAt: T0 - 1 }, j.periods[1]] }),
    ],
    [
      "relapse for an unknown period",
      (j: Journey) => ({ ...j, relapses: [{ ...j.relapses[0], periodId: "nope" }] }),
    ],
    [
      "intensity out of range",
      (j: Journey) => ({ ...j, urges: [{ ...j.urges[0], intensity: 11 }] }),
    ],
    ["unknown outcome", (j: Journey) => ({ ...j, urges: [{ ...j.urges[0], outcome: "maybe" }] })],
    ["duplicate event ids", (j: Journey) => ({ ...j, urges: [{ ...j.urges[0], id: "r1" }] })],
    [
      "note too long",
      (j: Journey) => ({ ...j, urges: [{ ...j.urges[0], note: "x".repeat(2001) }] }),
    ],
    ["bad milestones", (j: Journey) => ({ ...j, milestoneHours: [24, "x"] })],
    ["duplicate milestones", (j: Journey) => ({ ...j, milestoneHours: [24, 24] })],
    ["inconsistent money", (j: Journey) => ({ ...j, money: { ...j.money, enabled: true } })],
    ["negative instant", (j: Journey) => ({ ...j, createdAt: -1 })],
    [
      "invalid retained milestone",
      (j: Journey) => ({
        ...j,
        periods: [{ ...j.periods[0], retainedMilestoneHours: [0] }, j.periods[1]],
      }),
    ],
    [
      "retained milestones not an array",
      (j: Journey) => ({
        ...j,
        periods: [{ ...j.periods[0], retainedMilestoneHours: "24" }, j.periods[1]],
      }),
    ],
  ])("rejects %s", (_label, mutate) => {
    expect(parseJourney(viaJson(mutate(fullJourney())))).toEqual({
      ok: false,
      error: "invalid_journey",
    });
  });

  it("copies values instead of keeping references to the input", () => {
    const input = viaJson(fullJourney()) as { urges: { copingActions: string[] }[] };
    const parsed = parseJourney(input);
    input.urges[0]?.copingActions.push("tampered");
    expect(parsed.ok && parsed.value.urges[0]?.copingActions).toEqual(["breathing"]);
  });
});
