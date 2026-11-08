import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, type Instant } from "@free/core";
import { count, intlLocale } from "./index";

const HOURS_PER_DAY = MS_PER_DAY / MS_PER_HOUR;

/** "7 giorni", "1 giorno", "36 ore": milestones are stored in hours. */
export function formatGoal(hours: number): string {
  return hours % HOURS_PER_DAY === 0 ? count("day", hours / HOURS_PER_DAY) : count("hour", hours);
}

/** Human duration for history and reflection: "12 giorni", "5 ore", "40 minuti". */
export function formatDuration(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe >= MS_PER_DAY) return count("day", Math.floor(safe / MS_PER_DAY));
  if (safe >= MS_PER_HOUR) return count("hour", Math.floor(safe / MS_PER_HOUR));
  return count("minute", Math.floor(safe / MS_PER_MINUTE));
}

/** One cached formatter per locale and options, created on first use. */
function cached<T>(cache: Map<string, T>, key: string, create: () => T): T {
  let value = cache.get(key);
  if (!value) {
    value = create();
    cache.set(key, value);
  }
  return value;
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const DAY: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
const DAY_TIME: Intl.DateTimeFormatOptions = { ...DAY, hour: "2-digit", minute: "2-digit" };

/**
 * Dates are shown in the device's current timezone (D-007), always with the year: a start
 * chosen more than a year ago must not look like today.
 */
export const formatDay = (instant: Instant) =>
  cached(
    dateFormatters,
    `${intlLocale()}|day`,
    () => new Intl.DateTimeFormat(intlLocale(), DAY),
  ).format(instant);
export const formatDayTime = (instant: Instant) =>
  cached(
    dateFormatters,
    `${intlLocale()}|dayTime`,
    () => new Intl.DateTimeFormat(intlLocale(), DAY_TIME),
  ).format(instant);

const currencyFormatters = new Map<string, Intl.NumberFormat>();

/** Whole major units; assumes a 2-decimal currency (EUR only in the MVP). */
export function formatMoney(amountMinor: number, currency: string): string {
  const formatter = cached(
    currencyFormatters,
    `${intlLocale()}|${currency}`,
    () =>
      new Intl.NumberFormat(intlLocale(), {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }),
  );
  return formatter.format(Math.floor(amountMinor / 100));
}

/** Spells a phone number digit by digit for screen readers: "8 0 0 5 5 8 8 2 2". */
export const spellDigits = (phone: string) => phone.replace(/\D/g, "").split("").join(" ");
