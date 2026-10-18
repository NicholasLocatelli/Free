import {
  err,
  ok,
  validateMoneySettings,
  type FrequencyUnit,
  type Instant,
  type MoneySettings,
  type Result,
} from "@free/core";

/**
 * Parsing of the free-text form inputs shared by onboarding, relapse and settings.
 * Pure functions: the screens only hold strings and render the errors.
 */

// --- moment: "now" or "N days ago at hh:mm" ----------------------------------------

export const MAX_DAYS_AGO = 3650;

export interface MomentInput {
  mode: "now" | "past";
  daysAgo: string;
  time: string;
}

export type MomentError = "invalid_days" | "invalid_time" | "in_future";

/**
 * Local calendar arithmetic (device timezone, DST handled by the platform); the result is
 * an absolute instant.
 */
export function parseMoment(input: MomentInput, now: Instant): Result<Instant, MomentError> {
  if (input.mode === "now") return ok(now);
  const days = Number(input.daysAgo.trim());
  if (!Number.isInteger(days) || days < 0 || days > MAX_DAYS_AGO) return err("invalid_days");
  const match = /^(\d{1,2})[:.](\d{2})$/.exec(input.time.trim());
  const hours = Number(match?.[1]);
  const minutes = Number(match?.[2]);
  if (!match || hours > 23 || minutes > 59) return err("invalid_time");
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  const instant = date.getTime();
  return instant > now ? err("in_future") : ok(instant);
}

/** Current local time as "hh:mm", the default for "past" mode. */
export function currentTimeText(now: Instant): string {
  const d = new Date(now);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// --- money baseline ---------------------------------------------------------------

const MINOR_PER_MAJOR = 100;
const MAX_SESSIONS = 100;

export interface MoneyInput {
  enabled: boolean;
  amount: string;
  sessions: string;
  frequencyUnit: FrequencyUnit;
}

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

/**
 * Enabled: both fields must be valid. Disabled: the estimate is hidden but a valid baseline
 * is kept, so switching it back on does not lose what the user typed.
 */
export function parseMoneyInput(input: MoneyInput): Result<MoneySettings, MoneyError> {
  const amount = parseAmountToMinor(input.amount);
  const sessions = parseSessions(input.sessions);
  if (input.enabled) {
    if (amount === null) return err("invalid_amount");
    if (sessions === null) return err("invalid_sessions");
  }
  const settings: MoneySettings = {
    enabled: input.enabled,
    currency: "EUR",
    amountPerSessionMinor: amount,
    sessionsPerUnit: sessions,
    frequencyUnit: input.frequencyUnit,
  };
  return validateMoneySettings(settings).ok ? ok(settings) : err("invalid_amount");
}

/** 1250 → "12,50", 5000 → "50" (Italian decimal comma). */
export function formatMinorForInput(minor: number): string {
  const whole = Math.floor(minor / MINOR_PER_MAJOR);
  const cents = minor % MINOR_PER_MAJOR;
  return cents === 0 ? String(whole) : `${whole},${String(cents).padStart(2, "0")}`;
}

export function moneyInputFromSettings(settings: MoneySettings): MoneyInput {
  return {
    enabled: settings.enabled,
    amount:
      settings.amountPerSessionMinor === null
        ? ""
        : formatMinorForInput(settings.amountPerSessionMinor),
    sessions:
      settings.sessionsPerUnit === null ? "" : String(settings.sessionsPerUnit).replace(".", ","),
    frequencyUnit: settings.frequencyUnit,
  };
}
