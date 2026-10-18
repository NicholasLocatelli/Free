import { MS_PER_HOUR, type Instant, type Journey } from "@free/core";

/**
 * Local reminders (issue #12). Pure planning: which notifications should exist right now.
 * The platform layer cancels everything and schedules exactly this list, so re-planning is
 * idempotent and duplicates are impossible.
 *
 * Privacy: titles and bodies never mention gambling, money, urges or relapses — they may be
 * read on a lock screen by someone else.
 */
export interface ReminderPrefs {
  checkInEnabled: boolean;
  /** Local time "hh:mm". */
  checkInTime: string;
  milestonesEnabled: boolean;
}

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  checkInEnabled: false,
  checkInTime: "20:00",
  milestonesEnabled: false,
};

export const REMINDER_SETTINGS_KEY = "reminders";

/** iOS keeps at most 64 pending local notifications; stay well below. */
export const MAX_MILESTONE_NOTIFICATIONS = 20;

export const NEUTRAL_COPY = {
  checkIn: { title: "Un momento per te?", body: "Apri l'app quando vuoi." },
  milestone: { title: "Hai un nuovo traguardo.", body: "Apri l'app per vederlo." },
} as const;

export type PlannedNotification =
  | { kind: "check-in"; id: string; hour: number; minute: number; title: string; body: string }
  | { kind: "milestone"; id: string; at: Instant; title: string; body: string };

export function parseTimeOfDay(text: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2})[:.](\d{2})$/.exec(text.trim());
  const hour = Number(match?.[1]);
  const minute = Number(match?.[2]);
  return match && hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

export function anyReminderEnabled(prefs: ReminderPrefs): boolean {
  return prefs.checkInEnabled || prefs.milestonesEnabled;
}

export function planReminders(
  journey: Journey | null,
  prefs: ReminderPrefs,
  now: Instant,
): PlannedNotification[] {
  const planned: PlannedNotification[] = [];
  const time = parseTimeOfDay(prefs.checkInTime);
  if (prefs.checkInEnabled && time) {
    planned.push({ kind: "check-in", id: "check-in", ...time, ...NEUTRAL_COPY.checkIn });
  }
  const open = journey?.periods.at(-1);
  if (prefs.milestonesEnabled && journey && open && open.endedAt === null) {
    journey.milestoneHours
      .map((hours) => ({ hours, at: open.startedAt + hours * MS_PER_HOUR }))
      .filter((m) => m.at > now)
      .slice(0, MAX_MILESTONE_NOTIFICATIONS)
      .forEach((m) => {
        planned.push({
          kind: "milestone",
          id: `milestone-${open.id}-${m.hours}`,
          at: m.at,
          ...NEUTRAL_COPY.milestone,
        });
      });
  }
  return planned;
}

export function serializePrefs(prefs: ReminderPrefs): string {
  return JSON.stringify(prefs);
}

/** Unreadable or partial values fall back to the defaults: reminders stay off. */
export function deserializePrefs(raw: string | null): ReminderPrefs {
  if (raw === null) return DEFAULT_REMINDER_PREFS;
  try {
    const parsed = JSON.parse(raw) as Partial<ReminderPrefs>;
    return {
      checkInEnabled: parsed.checkInEnabled === true,
      checkInTime:
        typeof parsed.checkInTime === "string" && parseTimeOfDay(parsed.checkInTime)
          ? parsed.checkInTime
          : DEFAULT_REMINDER_PREFS.checkInTime,
      milestonesEnabled: parsed.milestonesEnabled === true,
    };
  } catch {
    return DEFAULT_REMINDER_PREFS;
  }
}
