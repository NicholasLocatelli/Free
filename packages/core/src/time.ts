/**
 * Time model.
 *
 * Every point in time is an absolute UTC instant (epoch milliseconds). Elapsed time is
 * always computed as `now - start`, so it is independent of the device timezone and of
 * daylight-saving transitions. A "day" in progress counters is a complete 24-hour block
 * since the start instant, not a calendar day (see docs/decisions/decision-log.md, D-007).
 */
export type Instant = number;

export const MS_PER_SECOND = 1_000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_WEEK = 7 * MS_PER_DAY;
/** Average Gregorian month (365.2425 / 12 days), used only for frequency estimates. */
export const MS_PER_AVERAGE_MONTH = (365.2425 / 12) * MS_PER_DAY;

export interface Clock {
  now(): Instant;
}

export const systemClock: Clock = { now: () => Date.now() };

export interface Elapsed {
  ms: number;
  /** True when `to` precedes `from`, e.g. the device clock was moved backwards. */
  clockSkew: boolean;
}

export function elapsedBetween(from: Instant, to: Instant): Elapsed {
  const diff = to - from;
  return diff < 0 ? { ms: 0, clockSkew: true } : { ms: diff, clockSkew: false };
}

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function breakdownDuration(ms: number): DurationParts {
  const safe = Math.max(0, Math.floor(ms));
  return {
    days: Math.floor(safe / MS_PER_DAY),
    hours: Math.floor((safe % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((safe % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((safe % MS_PER_MINUTE) / MS_PER_SECOND),
  };
}

export function isValidInstant(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}
