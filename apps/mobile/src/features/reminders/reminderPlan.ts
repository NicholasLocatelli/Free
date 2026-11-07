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

/** iOS keeps at most 64 pending local notifications: 30 check-ins + 20 milestones fit. */
export const MAX_MILESTONE_NOTIFICATIONS = 20;
/**
 * Check-ins are scheduled one by one so each day can show a different text. The window is
 * re-planned every time the app opens, so it only runs out after 30 days without opening it.
 */
export const CHECK_IN_DAYS = 30;

/** Rotated daily (owner's request, ONB-15). Neutral: the lock screen may show them. */
export const CHECK_IN_TITLES = [
  "Come va oggi?",
  "Prenditi il tuo tempo.",
  "Un momento per te?",
  "Un passo alla volta.",
  "Respira con calma.",
] as const;

export const NEUTRAL_COPY = {
  checkIn: { body: "Apri l'app quando vuoi." },
  milestone: { title: "Hai un nuovo traguardo.", body: "Apri l'app per vederlo." },
} as const;

export interface PlannedNotification {
  kind: "check-in" | "milestone";
  id: string;
  at: Instant;
  title: string;
  body: string;
}

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
  if (prefs.checkInEnabled && time) planned.push(...planCheckIns(time, now));
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

/** Next CHECK_IN_DAYS local occurrences of hh:mm (DST handled by the platform). */
function planCheckIns(time: { hour: number; minute: number }, now: Instant): PlannedNotification[] {
  const first = new Date(now);
  first.setHours(time.hour, time.minute, 0, 0);
  if (first.getTime() <= now) first.setDate(first.getDate() + 1);
  return Array.from({ length: CHECK_IN_DAYS }, (_, i) => {
    const day = new Date(first);
    day.setDate(first.getDate() + i);
    const key = localDateKey(day);
    return {
      kind: "check-in" as const,
      id: `check-in-${key}`,
      at: day.getTime(),
      title: checkInTitle(key),
      body: NEUTRAL_COPY.checkIn.body,
    };
  });
}

const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Text for a calendar day: looks random but is stable, so re-planning on every app start
 * never changes a day's message, and two consecutive days never repeat the same one.
 */
export function checkInTitle(dateKey: string): string {
  const index = (key: string) => {
    let hash = 0;
    for (const char of key) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
    return hash % CHECK_IN_TITLES.length;
  };
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - 1);
  const today = index(dateKey);
  const chosen = today === index(localDateKey(date)) ? (today + 1) % CHECK_IN_TITLES.length : today;
  return CHECK_IN_TITLES[chosen] ?? CHECK_IN_TITLES[0];
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
