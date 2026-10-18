import {
  DEFAULT_MILESTONE_HOURS,
  ok,
  type FrequencyUnit,
  type Instant,
  type MoneySettings,
  type Result,
} from "@free/core";
import {
  parseMoment,
  parseMoneyInput,
  type MomentError,
  type MoneyError,
} from "../shared/formInputs";

export {
  currentTimeText,
  MAX_DAYS_AGO,
  parseAmountToMinor,
  parseSessions,
  type MoneyError,
} from "../shared/formInputs";

/**
 * Pure onboarding logic (docs/ux/user-flows.md, Flow 1). The UI only renders a step and
 * edits the draft; parsing, validation and the final command input live here.
 */
export const ONBOARDING_STEPS = [
  "welcome",
  "category",
  "start",
  "goal",
  "money",
  "reminders",
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const FIRST_GOAL_OPTIONS: readonly number[] = [24, 72, 168, 720];

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

// --- start ---------------------------------------------------------------------------

export type StartError = MomentError;

export function parseStart(draft: OnboardingDraft, now: Instant): Result<Instant, StartError> {
  return parseMoment({ mode: draft.startMode, daysAgo: draft.daysAgo, time: draft.time }, now);
}

// --- goal ---------------------------------------------------------------------------

/** The chosen first goal becomes the first milestone; later default milestones follow. */
export function milestonesFromFirstGoal(firstGoalHours: number): number[] {
  return [firstGoalHours, ...DEFAULT_MILESTONE_HOURS.filter((h) => h > firstGoalHours)];
}

// --- money --------------------------------------------------------------------------

export function parseMoney(draft: OnboardingDraft): Result<MoneySettings | undefined, MoneyError> {
  if (!draft.moneyEnabled) return ok(undefined);
  return parseMoneyInput({
    enabled: true,
    amount: draft.amount,
    sessions: draft.sessions,
    frequencyUnit: draft.frequencyUnit,
  });
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
