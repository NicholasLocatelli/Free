import { MS_PER_DAY, MS_PER_HOUR, type Journey } from "@free/core";
import { LANGUAGES, setLanguage } from "../../i18n";
import { newJourney, T0 } from "../../test/fixtures";
import {
  DEFAULT_REMINDER_PREFS,
  deserializePrefs,
  CHECK_IN_DAYS,
  checkInTitles,
  MAX_MILESTONE_NOTIFICATIONS,
  parseTimeOfDay,
  planReminders,
  serializePrefs,
} from "./reminderPlan";

const ON = { checkInEnabled: true, checkInTime: "21:30", milestonesEnabled: true };

describe("planReminders", () => {
  it("plans nothing while reminders are off (the default)", () => {
    expect(planReminders(newJourney(), DEFAULT_REMINDER_PREFS, T0)).toEqual([]);
  });

  it("plans a check-in at the chosen local time for each of the next days", () => {
    // T0 is 1 Oct 2026, 22:00 in Rome: 21:30 has passed, so the first one is tomorrow.
    const plan = planReminders(null, { ...ON, milestonesEnabled: false }, T0);
    expect(plan).toHaveLength(CHECK_IN_DAYS);
    expect(plan[0]).toMatchObject({
      kind: "check-in",
      id: "check-in-2026-10-02",
      at: Date.UTC(2026, 9, 2, 19, 30),
      body: "Apri l'app quando vuoi.",
    });
    // Rome leaves summer time on 25 Oct: still 21:30 local, one hour later in UTC.
    expect(plan.find((n) => n.id === "check-in-2026-10-26")?.at).toBe(
      Date.UTC(2026, 9, 26, 20, 30),
    );
  });

  it("plans today's check-in when its time is still ahead", () => {
    const plan = planReminders(null, { ...ON, checkInTime: "23:00", milestonesEnabled: false }, T0);
    expect(plan[0]?.id).toBe("check-in-2026-10-01");
  });

  it("varies the text from day to day, stably across re-plans (ONB-15)", () => {
    const plan = planReminders(null, { ...ON, milestonesEnabled: false }, T0);
    const titles = plan.map((n) => n.title);
    expect(titles.every((title) => checkInTitles().includes(title))).toBe(true);
    expect(new Set(titles).size).toBeGreaterThan(2);
    titles.slice(1).forEach((title, i) => {
      expect(title).not.toBe(titles[i]);
    });
    const later = planReminders(null, { ...ON, milestonesEnabled: false }, T0 + 3 * MS_PER_DAY);
    const sameDay = later.find((n) => n.id === "check-in-2026-10-10");
    expect(sameDay?.title).toBe(plan.find((n) => n.id === "check-in-2026-10-10")?.title);
  });

  it("stays under the iOS limit of 64 pending notifications", () => {
    const many: Journey = {
      ...newJourney(),
      milestoneHours: Array.from({ length: 40 }, (_, i) => (i + 1) * 24),
    };
    expect(planReminders(many, ON, T0).length).toBeLessThanOrEqual(64);
  });

  it("plans only future milestones of the current period", () => {
    const now = T0 + 2 * MS_PER_DAY; // 24h already reached
    const plan = planReminders(newJourney(), { ...ON, checkInEnabled: false }, now);
    expect(plan[0]).toEqual({
      kind: "milestone",
      id: "milestone-period-1-72",
      at: T0 + 72 * MS_PER_HOUR,
      title: "Hai un nuovo traguardo.",
      body: "Apri l'app per vederlo.",
    });
    expect(plan.every((n) => n.kind === "milestone" && n.at > now)).toBe(true);
  });

  it("re-plans from the new period after a relapse (ids change, no stale reminders)", () => {
    const journey = newJourney();
    const relapsed: Journey = {
      ...journey,
      periods: [
        {
          id: "period-1",
          startedAt: T0,
          endedAt: T0 + MS_PER_DAY,
          endReason: "relapse",
          retainedMilestoneHours: [],
        },
        {
          id: "period-2",
          startedAt: T0 + MS_PER_DAY,
          endedAt: null,
          endReason: null,
          retainedMilestoneHours: [],
        },
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
    const text = LANGUAGES.flatMap((language) => {
      setLanguage(language);
      const plan = planReminders(newJourney(), ON, T0);
      setLanguage("it");
      return plan.flatMap((n) => [n.title, n.body]);
    }).join(" ");
    expect(text).not.toMatch(
      /gioc|azzard|scommess|denaro|soldi|ricadut|impuls|giorni senza|gambl|bet|casino|money|relapse|urge/i,
    );
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
