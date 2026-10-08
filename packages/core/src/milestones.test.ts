import { describe, expect, it } from "vitest";
import { DEFAULT_MILESTONE_HOURS } from "./categories";
import { achievedMilestones, milestoneProgress, normalizeMilestones } from "./milestones";
import { MS_PER_HOUR } from "./time";
import type { Period } from "./types";

describe("milestoneProgress", () => {
  it("starts with nothing reached and the first milestone next", () => {
    expect(milestoneProgress(0, DEFAULT_MILESTONE_HOURS)).toEqual({
      reached: [],
      next: 24,
      progressToNext: 0,
    });
  });

  it("measures progress between the previous and next milestone", () => {
    const progress = milestoneProgress(48 * MS_PER_HOUR, DEFAULT_MILESTONE_HOURS);
    expect(progress.reached).toEqual([24]);
    expect(progress.next).toBe(72);
    expect(progress.progressToNext).toBeCloseTo(0.5);
  });

  it("reaches a milestone exactly at its threshold", () => {
    expect(milestoneProgress(24 * MS_PER_HOUR, [24]).reached).toEqual([24]);
  });

  it("reports completion when every milestone is reached", () => {
    expect(milestoneProgress(10_000 * MS_PER_HOUR, [24, 72])).toEqual({
      reached: [24, 72],
      next: null,
      progressToNext: 1,
    });
  });
});

describe("normalizeMilestones", () => {
  it("sorts and de-duplicates", () => {
    expect(normalizeMilestones([72, 24, 72])).toEqual({ ok: true, value: [24, 72] });
  });

  it.each([
    [[], "empty"],
    [[0], "invalid_value"],
    [[-24], "invalid_value"],
    [[1.5], "invalid_value"],
    [Array.from({ length: 51 }, (_, i) => i + 1), "too_many"],
  ] as const)("rejects %o", (hours, error) => {
    expect(normalizeMilestones(hours)).toEqual({ ok: false, error });
  });
});

describe("achievedMilestones", () => {
  it("keeps milestones reached by closed periods", () => {
    const periods: Period[] = [
      { id: "a", startedAt: 0, endedAt: 80 * MS_PER_HOUR, endReason: "relapse" },
      { id: "b", startedAt: 80 * MS_PER_HOUR, endedAt: null, endReason: null },
    ];
    const achieved = achievedMilestones(periods, [24, 72, 168], 110 * MS_PER_HOUR);
    expect(achieved.map((m) => `${m.periodId}:${m.hours}`)).toEqual(["a:24", "a:72", "b:24"]);
  });
});
