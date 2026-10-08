import { currentPeriod } from "./journey";
import {
  achievedMilestones,
  milestoneProgress,
  type AchievedMilestone,
  type MilestoneProgress,
} from "./milestones";
import { estimateMoneyNotSpent, type MoneyEstimate } from "./money";
import { breakdownDuration, elapsedBetween, type DurationParts, type Instant } from "./time";
import type { Journey, Period } from "./types";

export function periodDurationMs(period: Period, now: Instant): number {
  return elapsedBetween(period.startedAt, period.endedAt ?? now).ms;
}

export interface CurrentPeriodView {
  periodId: string;
  startedAt: Instant;
  elapsedMs: number;
  parts: DurationParts;
  clockSkew: boolean;
  milestones: MilestoneProgress;
  money: MoneyEstimate;
}

/** Read model for the dashboard, recomputed from stored instants on every tick. */
export function currentPeriodView(journey: Journey, now: Instant): CurrentPeriodView | null {
  const open = currentPeriod(journey);
  if (!open) return null;
  const elapsed = elapsedBetween(open.startedAt, now);
  return {
    periodId: open.id,
    startedAt: open.startedAt,
    elapsedMs: elapsed.ms,
    parts: breakdownDuration(elapsed.ms),
    clockSkew: elapsed.clockSkew,
    milestones: milestoneProgress(elapsed.ms, journey.milestoneHours),
    money: estimateMoneyNotSpent(journey.money, elapsed.ms),
  };
}

export interface JourneyStats {
  periodsCount: number;
  relapsesCount: number;
  longestPeriodMs: number;
  /** Sum of all periods: progress that a relapse does not erase. */
  totalTimeMs: number;
  urgesCount: number;
  urgesResistedCount: number;
  achievedMilestones: AchievedMilestone[];
  totalMoney: MoneyEstimate;
}

export function journeyStats(journey: Journey, now: Instant): JourneyStats {
  const durations = journey.periods.map((p) => periodDurationMs(p, now));
  const totalTimeMs = durations.reduce((sum, d) => sum + d, 0);
  return {
    periodsCount: journey.periods.length,
    relapsesCount: journey.relapses.length,
    longestPeriodMs: Math.max(0, ...durations),
    totalTimeMs,
    urgesCount: journey.urges.length,
    urgesResistedCount: journey.urges.filter((u) => u.outcome === "resisted").length,
    achievedMilestones: achievedMilestones(journey.periods, journey.milestoneHours, now),
    totalMoney: estimateMoneyNotSpent(journey.money, totalTimeMs),
  };
}
