import { DEFAULT_MILESTONE_HOURS } from "@free/core";
import {
  currentTimeText,
  deserializeProgress,
  INITIAL_PROGRESS,
  milestonesFromFirstGoal,
  nextStep,
  parseAmountToMinor,
  parseMoney,
  parseSessions,
  parseStart,
  previousStep,
  serializeProgress,
  type OnboardingDraft,
} from "./onboardingModel";

// Tests run with TZ=Europe/Rome (see package.json "test" script).
const NOW = Date.UTC(2026, 9, 8, 18, 30); // 8 Oct 2026, 20:30 in Rome (CEST)
const draft = (patch: Partial<OnboardingDraft>): OnboardingDraft => ({
  ...INITIAL_PROGRESS.draft,
  ...patch,
});

describe("steps", () => {
  it("moves forward and back through the flow", () => {
    expect(nextStep("welcome")).toBe("category");
    expect(nextStep("money")).toBeNull();
    expect(previousStep("start")).toBe("category");
    expect(previousStep("welcome")).toBeNull();
  });
});

describe("parseStart", () => {
  it("uses the current instant for 'now'", () => {
    expect(parseStart(draft({ startMode: "now" }), NOW)).toEqual({ ok: true, value: NOW });
  });

  it("computes 'N days ago at hh:mm' in local time", () => {
    const result = parseStart(draft({ startMode: "past", daysAgo: "2", time: "21:40" }), NOW);
    expect(result).toEqual({ ok: true, value: Date.UTC(2026, 9, 6, 19, 40) });
  });

  it("handles a DST change between then and now (Rome switches on 25 Oct)", () => {
    const afterDst = Date.UTC(2026, 9, 27, 12, 0); // 13:00 CET
    const result = parseStart(draft({ startMode: "past", daysAgo: "3", time: "10:00" }), afterDst);
    expect(result).toEqual({ ok: true, value: Date.UTC(2026, 9, 24, 8, 0) }); // 10:00 CEST
  });

  it.each([
    [{ daysAgo: "-1" }, "invalid_days"],
    [{ daysAgo: "abc" }, "invalid_days"],
    [{ daysAgo: "3651" }, "invalid_days"],
    [{ time: "25:00" }, "invalid_time"],
    [{ time: "9" }, "invalid_time"],
    [{ daysAgo: "0", time: "23:59" }, "in_future"],
  ])("rejects %o with %s", (patch, error) => {
    const result = parseStart(
      draft({ startMode: "past", daysAgo: "1", time: "10:00", ...patch }),
      NOW,
    );
    expect(result).toEqual({ ok: false, error });
  });

  it("accepts a dot as time separator", () => {
    expect(parseStart(draft({ startMode: "past", daysAgo: "0", time: "8.05" }), NOW).ok).toBe(true);
  });

  it("formats the current local time", () => {
    expect(currentTimeText(NOW)).toBe("20:30");
  });
});

describe("milestonesFromFirstGoal", () => {
  it("starts from the chosen goal and keeps the later defaults", () => {
    expect(milestonesFromFirstGoal(168)).toEqual([168, 336, 720, 1440, 2160, 4320, 8760]);
    expect(milestonesFromFirstGoal(24)).toEqual([...DEFAULT_MILESTONE_HOURS]);
  });
});

describe("money", () => {
  it.each([
    ["50", 5000],
    ["12,50", 1250],
    ["12.5", 1250],
    [" 7 ", 700],
    ["0", 0],
  ])("parses %s as %i cents", (text, cents) => {
    expect(parseAmountToMinor(text)).toBe(cents);
  });

  it.each(["", "abc", "-5", "1,234", "12,345"])("rejects amount %s", (text) => {
    expect(parseAmountToMinor(text)).toBeNull();
  });

  it.each([
    ["2", 2],
    ["1,5", 1.5],
    ["", null],
    ["0", null],
    ["101", null],
  ])("parses sessions %s", (text, value) => {
    expect(parseSessions(text)).toBe(value);
  });

  it("is optional", () => {
    expect(parseMoney(draft({ moneyEnabled: false }))).toEqual({ ok: true, value: undefined });
  });

  it("builds validated settings", () => {
    expect(
      parseMoney(draft({ moneyEnabled: true, amount: "50", sessions: "2", frequencyUnit: "week" })),
    ).toEqual({
      ok: true,
      value: {
        enabled: true,
        currency: "EUR",
        amountPerSessionMinor: 5000,
        sessionsPerUnit: 2,
        frequencyUnit: "week",
      },
    });
  });

  it("reports which field is wrong", () => {
    expect(parseMoney(draft({ moneyEnabled: true, amount: "x", sessions: "2" }))).toEqual({
      ok: false,
      error: "invalid_amount",
    });
    expect(parseMoney(draft({ moneyEnabled: true, amount: "5", sessions: "" }))).toEqual({
      ok: false,
      error: "invalid_sessions",
    });
  });
});

describe("progress persistence", () => {
  it("round-trips", () => {
    const progress = { step: "goal" as const, draft: draft({ firstGoalHours: 168 }) };
    expect(deserializeProgress(serializeProgress(progress))).toEqual(progress);
  });

  it.each([null, "not json", '{"step":"bogus","draft":{}}', '{"step":"goal"}'])(
    "falls back to the start for %s",
    (raw) => {
      expect(deserializeProgress(raw)).toEqual(INITIAL_PROGRESS);
    },
  );

  it("fills fields added by newer versions with defaults", () => {
    expect(deserializeProgress('{"step":"money","draft":{"amount":"9"}}').draft).toEqual(
      draft({ amount: "9" }),
    );
  });
});
