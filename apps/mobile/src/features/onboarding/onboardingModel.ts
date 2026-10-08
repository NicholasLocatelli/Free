import {
  DEFAULT_MILESTONE_HOURS,
  err,
  ok,
  validateMoneySettings,
  type FrequencyUnit,
  type Instant,
  type MoneySettings,
  type Result,
} from "@free/core";

/**
 * Pure onboarding logic (docs/ux/user-flows.md, Flow 1). The UI only renders a step and
 * edits the draft; parsing, validation and the final command input live here.
 */
export const ONBOARDING_STEPS = ["welcome", "category", "start", "goal", "money"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const FIRST_GOAL_OPTIONS: readonly number[] = [24, 72, 168, 720];
export const MAX_DAYS_AGO = 3650;
const MINOR_PER_MAJOR = 100;
const MAX_SESSIONS = 100;

export interface OnboardingDraft {
  startMode: "now" | "past";
  daysAgo: string;
  time: string;
  firstGoalHours: number;
  moneyEnabled: boolean;
  amount: string;
  sessions: string;
  frequencyUnit: FrequencyUnit;
}

export interface OnboardingProgress {
  step: OnboardingStep;
  draft: OnboardingDraft;
}

export const INITIAL_PROGRESS: OnboardingProgress = {
  step: "welcome",
  draft: {
    startMode: "now",
    daysAgo: "1",
    time: "",
    firstGoalHours: 24,
    moneyEnabled: false,
    amount: "",
    sessions: "",
    frequencyUnit: "week",
  },
};

export function nextStep(step: OnboardingStep): OnboardingStep | null {
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1] ?? null;
}

export function previousStep(step: OnboardingStep): OnboardingStep | null {
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) - 1] ?? null;
}

// --- start --------------------------------------------------------------------------

export type StartError = "invalid_days" | "invalid_time" | "in_future";

/**
 * "N giorni fa alle hh:mm" in the device timezone. Calendar arithmetic uses local Date
 * fields, so DST days are handled by the platform; the result is an absolute instant.
 */
export function parseStart(draft: OnboardingDraft, now: Instant): Result<Instant, StartError> {
  if (draft.startMode === "now") return ok(now);
  const days = Number(draft.daysAgo.trim());
  if (!Number.isInteger(days) || days < 0 || days > MAX_DAYS_AGO) return err("invalid_days");
  const match = /^(\d{1,2})[:.](\d{2})$/.exec(draft.time.trim());
  const hours = Number(match?.[1]);
  const minutes = Number(match?.[2]);
  if (!match || hours > 23 || minutes > 59) return err("invalid_time");
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  const instant = date.getTime();
  return instant > now ? err("in_future") : ok(instant);
}

/** Default time for "past" mode: the current local time, e.g. "21:40". */
export function currentTimeText(now: Instant): string {
  const d = new Date(now);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// --- goal ---------------------------------------------------------------------------

/** The chosen first goal becomes the first milestone; later default milestones follow. */
export function milestonesFromFirstGoal(firstGoalHours: number): number[] {
  return [firstGoalHours, ...DEFAULT_MILESTONE_HOURS.filter((h) => h > firstGoalHours)];
}

// --- money --------------------------------------------------------------------------

export type MoneyError = "invalid_amount" | "invalid_sessions";

/** "50", "12,50", "12.5" → 5000, 1250, 1250 (cents). */
export function parseAmountToMinor(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * MINOR_PER_MAJOR);
}

export function parseSessions(text: string): number | null {
  const value = Number(text.trim().replace(",", "."));
  return text.trim() !== "" && Number.isFinite(value) && value > 0 && value <= MAX_SESSIONS
    ? value
    : null;
}

export function parseMoney(draft: OnboardingDraft): Result<MoneySettings | undefined, MoneyError> {
  if (!draft.moneyEnabled) return ok(undefined);
  const amount = parseAmountToMinor(draft.amount);
  if (amount === null) return err("invalid_amount");
  const sessions = parseSessions(draft.sessions);
  if (sessions === null) return err("invalid_sessions");
  const settings: MoneySettings = {
    enabled: true,
    currency: "EUR",
    amountPerSessionMinor: amount,
    sessionsPerUnit: sessions,
    frequencyUnit: draft.frequencyUnit,
  };
  return validateMoneySettings(settings).ok ? ok(settings) : err("invalid_amount");
}

// --- persistence of an interrupted onboarding (ONB-5) -------------------------------

export const ONBOARDING_SETTINGS_KEY = "onboarding";

export function serializeProgress(progress: OnboardingProgress): string {
  return JSON.stringify(progress);
}

/** Anything unreadable falls back to the start: onboarding holds no irreplaceable data. */
export function deserializeProgress(raw: string | null): OnboardingProgress {
  if (raw === null) return INITIAL_PROGRESS;
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingProgress>;
    const step = parsed.step;
    if (!step || !ONBOARDING_STEPS.includes(step) || typeof parsed.draft !== "object") {
      return INITIAL_PROGRESS;
    }
    return { step, draft: { ...INITIAL_PROGRESS.draft, ...parsed.draft } };
  } catch {
    return INITIAL_PROGRESS;
  }
}
