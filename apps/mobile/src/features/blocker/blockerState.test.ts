import { MS_PER_DAY } from "@free/core";
import {
  DEFAULT_BLOCKER_STATE,
  deserializeBlockerState,
  disableBlocker,
  enableBlocker,
  isCommitted,
  remainingCommitmentMs,
  serializeBlockerState,
  type BlockerState,
} from "./blockerState";

const NOW = Date.UTC(2026, 10, 27, 12, 0);
const purchased: BlockerState = { ...DEFAULT_BLOCKER_STATE, purchased: true };

function unwrap<T>(r: { ok: true; value: T } | { ok: false; error: string }): T {
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

describe("site blocker state", () => {
  it("requires the purchase to turn on", () => {
    expect(enableBlocker(DEFAULT_BLOCKER_STATE, null, NOW)).toEqual({
      ok: false,
      error: "not_purchased",
    });
  });

  it("turns on and off freely without a commitment", () => {
    const on = unwrap(enableBlocker(purchased, null, NOW));
    expect(on).toMatchObject({ enabled: true, commitmentEndsAt: null });
    expect(unwrap(disableBlocker(on, NOW))).toMatchObject({ enabled: false });
  });

  it("refuses to turn off during a commitment, then allows it", () => {
    const on = unwrap(enableBlocker(purchased, 7, NOW));
    expect(isCommitted(on, NOW)).toBe(true);
    expect(remainingCommitmentMs(on, NOW + MS_PER_DAY)).toBe(6 * MS_PER_DAY);
    expect(disableBlocker(on, NOW + 6 * MS_PER_DAY)).toEqual({ ok: false, error: "in_commitment" });
    expect(unwrap(disableBlocker(on, NOW + 7 * MS_PER_DAY))).toMatchObject({
      enabled: false,
      commitmentEndsAt: null,
    });
  });

  it("never shortens a running commitment", () => {
    const thirty = unwrap(enableBlocker(purchased, 30, NOW));
    const again = unwrap(enableBlocker(thirty, 1, NOW + MS_PER_DAY));
    expect(again.commitmentEndsAt).toBe(NOW + 30 * MS_PER_DAY);
    const longer = unwrap(enableBlocker(thirty, 90, NOW));
    expect(longer.commitmentEndsAt).toBe(NOW + 90 * MS_PER_DAY);
  });

  it("explains why it cannot turn off something already off", () => {
    expect(disableBlocker(purchased, NOW)).toEqual({ ok: false, error: "not_enabled" });
  });

  it("round-trips and falls back to off for unreadable values", () => {
    const on = unwrap(enableBlocker(purchased, 30, NOW));
    expect(deserializeBlockerState(serializeBlockerState(on))).toEqual(on);
    expect(deserializeBlockerState(null)).toEqual(DEFAULT_BLOCKER_STATE);
    expect(deserializeBlockerState("{")).toEqual(DEFAULT_BLOCKER_STATE);
    expect(deserializeBlockerState('{"purchased":"yes","commitmentEndsAt":"x"}')).toEqual(
      DEFAULT_BLOCKER_STATE,
    );
  });
});
