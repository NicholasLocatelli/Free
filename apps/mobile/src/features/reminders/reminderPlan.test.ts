import { MS_PER_DAY, MS_PER_HOUR, type Journey } from "@free/core";
import { newJourney, T0 } from "../../test/fixtures";
import {
  DEFAULT_REMINDER_PREFS,
  deserializePrefs,
  MAX_MILESTONE_NOTIFICATIONS,
  NEUTRAL_COPY,
  parseTimeOfDay,
  planReminders,
  serializePrefs,
} from "./reminderPlan";

const ON = { checkInEnabled: true, checkInTime: "21:30", milestonesEnabled: true };

describe("planReminders", () => {
  it("plans nothing while reminders are off (the default)", () => {
    expect(planReminders(newJourney(), DEFAULT_REMINDER_PREFS, T0)).toEqual([]);
  });

  it("plans a daily check-in at the chosen local time", () => {
    const plan = planReminders(null, { ...ON, milestonesEnabled: false }, T0);
    expect(plan).toEqual([
      { kind: "check-in", id: "check-in", hour: 21, minute: 30, ...NEUTRAL_COPY.checkIn },
    ]);
  });

  it("plans only future milestones of the current period", () => {
    const now = T0 + 2 * MS_PER_DAY; // 24h already reached
    const plan = planReminders(newJourney(), { ...ON, checkInEnabled: false }, now);
    expect(plan[0]).toEqual({
      kind: "milestone",
      id: "milestone-period-1-72",
      at: T0 + 72 * MS_PER_HOUR,
      ...NEUTRAL_COPY.milestone,
    });
    expect(plan.every((n) => n.kind === "milestone" && n.at > now)).toBe(true);
  });

  it("re-plans from the new period after a relapse (ids change, no stale reminders)", () => {
    const journey = newJourney();
    const relapsed: Journey = {
      ...journey,
      periods: [
        { id: "period-1", startedAt: T0, endedAt: T0 + MS_PER_DAY, endReason: "relapse" },
        { id: "period-2", startedAt: T0 + MS_PER_DAY, endedAt: null, endReason: null },
      ],
    };
    const ids = planReminders(relapsed, { ...ON, checkInEnabled: false }, T0 + MS_PER_DAY).map(
      (n) => n.id,
    );
    expect(ids.every((id) => id.startsWith("milestone-period-2-"))).toBe(true);
  });

  it("caps milestone notifications under the iOS limit", () => {
    const many: Journey = {
      ...newJourney(),
      milestoneHours: Array.from({ length: 40 }, (_, i) => (i + 1) * 24),
    };
    const plan = planReminders(many, { ...ON, checkInEnabled: false }, T0);
    expect(plan).toHaveLength(MAX_MILESTONE_NOTIFICATIONS);
  });

  it("never mentions gambling, money or relapses in what the lock screen may show", () => {
    const text = Object.values(NEUTRAL_COPY)
      .flatMap((c) => [c.title, c.body])
      .join(" ");
    expect(text).not.toMatch(/gioc|azzard|scommess|denaro|soldi|ricadut|impuls|giorni senza/i);
  });
});

describe("prefs", () => {
  it.each([
    ["21:30", { hour: 21, minute: 30 }],
    ["7.05", { hour: 7, minute: 5 }],
    ["24:00", null],
    ["abc", null],
  ])("parses time %s", (text, expected) => {
    expect(parseTimeOfDay(text)).toEqual(expected);
  });

  it("round-trips and falls back to 'off' for unreadable values", () => {
    expect(deserializePrefs(serializePrefs(ON))).toEqual(ON);
    expect(deserializePrefs(null)).toEqual(DEFAULT_REMINDER_PREFS);
    expect(deserializePrefs("garbage")).toEqual(DEFAULT_REMINDER_PREFS);
    expect(deserializePrefs('{"checkInEnabled":"yes","checkInTime":"99:99"}')).toEqual(
      DEFAULT_REMINDER_PREFS,
    );
  });
});
