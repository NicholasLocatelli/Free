import { MS_PER_DAY, MS_PER_HOUR, type Instant } from "@free/core";

const HOURS_PER_DAY = MS_PER_DAY / MS_PER_HOUR;

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "7 giorni", "1 giorno", "36 ore": milestones are stored in hours. */
export function formatGoal(hours: number): string {
  return hours % HOURS_PER_DAY === 0
    ? plural(hours / HOURS_PER_DAY, "giorno", "giorni")
    : plural(hours, "ora", "ore");
}

const dayMonth = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long" });
const dayMonthTime = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** Dates are shown in the device's current timezone (D-007). */
export const formatDay = (instant: Instant) => dayMonth.format(instant);
export const formatDayTime = (instant: Instant) => dayMonthTime.format(instant);

const currencyFormatters = new Map<string, Intl.NumberFormat>();

/** Whole major units; assumes a 2-decimal currency (EUR only in the MVP). */
export function formatMoney(amountMinor: number, currency: string): string {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(Math.floor(amountMinor / 100));
}

/** Spells a phone number digit by digit for screen readers: "8 0 0 5 5 8 8 2 2". */
export const spellDigits = (phone: string) => phone.replace(/\D/g, "").split("").join(" ");
