import type { CategoryId } from "./categories";
import type { MoneySettings } from "./money";
import type { Instant } from "./time";

export type PeriodEndReason = "relapse";

/** A continuous stretch of the journey. At most one period (the last) is open. */
export interface Period {
  id: string;
  startedAt: Instant;
  endedAt: Instant | null;
  endReason: PeriodEndReason | null;
}

export interface RelapseEvent {
  id: string;
  /** The period this relapse closed. */
  periodId: string;
  occurredAt: Instant;
  recordedAt: Instant;
  contributingFactors: readonly string[];
  note: string | null;
}

export type UrgeOutcome = "resisted" | "acted";

export interface UrgeEvent {
  id: string;
  occurredAt: Instant;
  recordedAt: Instant;
  /** Integer 1..10. */
  intensity: number;
  trigger: string | null;
  durationMinutes: number | null;
  copingActions: readonly string[];
  outcome: UrgeOutcome;
  note: string | null;
}

/** The user's path for one category. Append-only history: nothing is ever deleted by events. */
export interface Journey {
  id: string;
  categoryId: CategoryId;
  createdAt: Instant;
  /** Chronological; every period except the last is closed. */
  periods: readonly Period[];
  relapses: readonly RelapseEvent[];
  urges: readonly UrgeEvent[];
  milestoneHours: readonly number[];
  money: MoneySettings;
}
