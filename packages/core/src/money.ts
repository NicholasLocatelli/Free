import { err, ok, type Result } from "./result";
import { MS_PER_AVERAGE_MONTH, MS_PER_DAY, MS_PER_WEEK } from "./time";

/**
 * "Estimated money not spent" is a projection from the user's own baseline, never a
 * balance. Amounts are integer minor units (e.g. cents) to avoid floating point drift.
 */
export type FrequencyUnit = "day" | "week" | "month";

export interface MoneySettings {
  enabled: boolean;
  /** ISO 4217 code, e.g. "EUR". */
  currency: string;
  /** Average spend per session in minor units; null until the user provides it. */
  amountPerSessionMinor: number | null;
  /** Number of sessions per `frequencyUnit`; null until the user provides it. */
  sessionsPerUnit: number | null;
  frequencyUnit: FrequencyUnit;
}

export const DEFAULT_MONEY_SETTINGS: MoneySettings = {
  enabled: false,
  currency: "EUR",
  amountPerSessionMinor: null,
  sessionsPerUnit: null,
  frequencyUnit: "week",
};

/** 10,000,000.00 in major units: generous ceiling that still keeps results safe integers. */
export const MAX_AMOUNT_PER_SESSION_MINOR = 1_000_000_000;
export const MAX_SESSIONS_PER_UNIT = 100;

const UNIT_MS: Readonly<Record<FrequencyUnit, number>> = {
  day: MS_PER_DAY,
  week: MS_PER_WEEK,
  month: MS_PER_AVERAGE_MONTH,
};

export type MoneySettingsError =
  "invalid_currency" | "invalid_amount" | "invalid_frequency" | "missing_baseline";

export function validateMoneySettings(
  settings: MoneySettings,
): Result<MoneySettings, MoneySettingsError> {
  if (!/^[A-Z]{3}$/.test(settings.currency)) return err("invalid_currency");
  const { amountPerSessionMinor: amount, sessionsPerUnit: sessions } = settings;
  if (
    amount !== null &&
    (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_AMOUNT_PER_SESSION_MINOR)
  ) {
    return err("invalid_amount");
  }
  if (
    sessions !== null &&
    (!Number.isFinite(sessions) || sessions < 0 || sessions > MAX_SESSIONS_PER_UNIT)
  ) {
    return err("invalid_frequency");
  }
  if (settings.enabled && (amount === null || sessions === null)) return err("missing_baseline");
  return ok(settings);
}

export type MoneyEstimate =
  | { status: "disabled" }
  | { status: "incomplete" }
  | { status: "estimated"; amountMinor: number; currency: string };

export function estimateMoneyNotSpent(settings: MoneySettings, elapsedMs: number): MoneyEstimate {
  if (!settings.enabled) return { status: "disabled" };
  const { amountPerSessionMinor: amount, sessionsPerUnit: sessions } = settings;
  if (amount === null || sessions === null) return { status: "incomplete" };
  const sessionsElapsed = (Math.max(0, elapsedMs) / UNIT_MS[settings.frequencyUnit]) * sessions;
  const raw = Math.floor(sessionsElapsed * amount);
  return {
    status: "estimated",
    amountMinor: Math.min(raw, Number.MAX_SAFE_INTEGER),
    currency: settings.currency,
  };
}
