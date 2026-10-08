import { err, ok, type Result } from "./result";
import { MS_PER_HOUR, type Instant } from "./time";
import type { Period } from "./types";

export const MAX_MILESTONES = 50;
/** 100 years: anything longer is almost certainly an input error. */
export const MAX_MILESTONE_HOURS = 100 * 366 * 24;

export type MilestoneConfigError = "empty" | "too_many" | "invalid_value";

/** Returns the milestones sorted and de-duplicated, or an error. */
export function normalizeMilestones(
  hours: readonly number[],
): Result<readonly number[], MilestoneConfigError> {
  if (hours.length === 0) return err("empty");
  if (hours.some((h) => !Number.isSafeInteger(h) || h <= 0 || h > MAX_MILESTONE_HOURS)) {
    return err("invalid_value");
  }
  const unique = [...new Set(hours)].sort((a, b) => a - b);
  if (unique.length > MAX_MILESTONES) return err("too_many");
  return ok(unique);
}

export interface MilestoneProgress {
  reached: readonly number[];
  /** Next milestone in hours, or null when every milestone is reached. */
  next: number | null;
  /** 0..1 progress from the previous milestone (or start) to `next`; 1 when all reached. */
  progressToNext: number;
}

export function milestoneProgress(
  elapsedMs: number,
  milestoneHours: readonly number[],
): MilestoneProgress {
  const elapsedHours = Math.max(0, elapsedMs) / MS_PER_HOUR;
  const reached = milestoneHours.filter((h) => h <= elapsedHours);
  const next = milestoneHours.find((h) => h > elapsedHours) ?? null;
  if (next === null) return { reached, next, progressToNext: 1 };
  const previous = reached.at(-1) ?? 0;
  return { reached, next, progressToNext: (elapsedHours - previous) / (next - previous) };
}

export interface AchievedMilestone {
  periodId: string;
  hours: number;
  achievedAt: Instant;
}

/**
 * Milestones are derived from period history rather than stored, so a relapse can never
 * delete one: a closed period keeps every milestone it reached before it ended.
 */
export function achievedMilestones(
  periods: readonly Period[],
  milestoneHours: readonly number[],
  now: Instant,
): AchievedMilestone[] {
  return periods.flatMap((period) => {
    const end = period.endedAt ?? now;
    return milestoneHours
      .map((hours) => ({
        periodId: period.id,
        hours,
        achievedAt: period.startedAt + hours * MS_PER_HOUR,
      }))
      .filter((m) => m.achievedAt <= end);
  });
}
