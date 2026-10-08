import { describe, expect, it } from "vitest";
import {
  breakdownDuration,
  elapsedBetween,
  isValidInstant,
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  systemClock,
} from "./time";

describe("elapsedBetween", () => {
  it("returns the difference between two instants", () => {
    expect(elapsedBetween(1_000, 61_000)).toEqual({ ms: 60_000, clockSkew: false });
  });

  it("clamps to zero and flags skew when the clock went backwards", () => {
    expect(elapsedBetween(10_000, 5_000)).toEqual({ ms: 0, clockSkew: true });
  });

  it("is unaffected by a DST change (Europe/Rome, 29 Mar 2026)", () => {
    // 01:00 UTC is 02:00 CET -> clocks jump to 03:00 CEST. Wall clock shows 2h, real time is 1h.
    const before = Date.UTC(2026, 2, 29, 0, 30);
    const after = Date.UTC(2026, 2, 29, 1, 30);
    expect(elapsedBetween(before, after).ms).toBe(MS_PER_HOUR);
  });
});

describe("breakdownDuration", () => {
  it("splits into days, hours, minutes, seconds", () => {
    const ms = 3 * MS_PER_DAY + 4 * MS_PER_HOUR + 5 * MS_PER_MINUTE + 6_000 + 999;
    expect(breakdownDuration(ms)).toEqual({ days: 3, hours: 4, minutes: 5, seconds: 6 });
  });

  it("treats a day as 24 complete hours, not a calendar day change", () => {
    expect(breakdownDuration(MS_PER_DAY - 1).days).toBe(0);
    expect(breakdownDuration(MS_PER_DAY).days).toBe(1);
  });

  it("never returns negative values", () => {
    expect(breakdownDuration(-5)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("systemClock / isValidInstant", () => {
  it("reads the device clock as a valid instant", () => {
    expect(isValidInstant(systemClock.now())).toBe(true);
  });

  it.each([-1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 2])("rejects %s", (value) => {
    expect(isValidInstant(value)).toBe(false);
  });
});
