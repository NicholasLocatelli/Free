import {
  CATEGORIES,
  type CategoryId,
  type FrequencyUnit,
  type Journey,
  type Period,
  type RelapseEvent,
  type UrgeEvent,
} from "@free/core";
import type { SqlValue } from "./SqlExecutor";

/**
 * Row ⇄ entity mapping. Reads are validated: a corrupted or hand-edited database surfaces
 * as DataCorruptionError (UI Flow 8) instead of leaking malformed values into the domain.
 */
export class DataCorruptionError extends Error {
  constructor(detail: string) {
    super(`Stored data is not valid: ${detail}`);
    this.name = "DataCorruptionError";
  }
}

export interface JourneyRow {
  id: string;
  category_id: string;
  created_at: number;
  milestone_hours: string;
  money_enabled: number;
  money_currency: string;
  money_amount_minor: number | null;
  money_sessions_per_unit: number | null;
  money_frequency_unit: string;
}

export interface PeriodRow {
  id: string;
  started_at: number;
  ended_at: number | null;
  end_reason: string | null;
}

export interface RelapseRow {
  id: string;
  period_id: string;
  occurred_at: number;
  recorded_at: number;
  contributing_factors: string;
  note: string | null;
}

export interface UrgeRow {
  id: string;
  occurred_at: number;
  recorded_at: number;
  intensity: number;
  trigger_tag: string | null;
  duration_minutes: number | null;
  coping_actions: string;
  outcome: string;
  note: string | null;
}

const FREQUENCY_UNITS: readonly string[] = ["day", "week", "month"];

function parseJsonArray<T>(raw: string, field: string, guard: (v: unknown) => v is T): T[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DataCorruptionError(`${field} is not JSON`);
  }
  if (!Array.isArray(parsed) || !parsed.every(guard)) {
    throw new DataCorruptionError(`${field} has unexpected content`);
  }
  return parsed;
}

const isString = (v: unknown): v is string => typeof v === "string";
const isPositiveInt = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) > 0;

function isCategoryId(value: string): value is CategoryId {
  return Object.hasOwn(CATEGORIES, value);
}

function isFrequencyUnit(value: string): value is FrequencyUnit {
  return FREQUENCY_UNITS.includes(value);
}

export function journeyFromRows(
  row: JourneyRow,
  periods: readonly PeriodRow[],
  relapses: readonly RelapseRow[],
  urges: readonly UrgeRow[],
): Journey {
  if (!isCategoryId(row.category_id)) throw new DataCorruptionError("unknown category");
  if (!isFrequencyUnit(row.money_frequency_unit)) {
    throw new DataCorruptionError("unknown frequency unit");
  }
  const mappedPeriods = periods.map(periodFromRow);
  const openIndex = mappedPeriods.findIndex((p) => p.endedAt === null);
  if (mappedPeriods.length === 0 || openIndex !== mappedPeriods.length - 1) {
    throw new DataCorruptionError("the open period must be the last one");
  }
  return {
    id: row.id,
    categoryId: row.category_id,
    createdAt: row.created_at,
    periods: mappedPeriods,
    relapses: relapses.map(relapseFromRow),
    urges: urges.map(urgeFromRow),
    milestoneHours: parseJsonArray(row.milestone_hours, "milestone_hours", isPositiveInt),
    money: {
      enabled: row.money_enabled === 1,
      currency: row.money_currency,
      amountPerSessionMinor: row.money_amount_minor,
      sessionsPerUnit: row.money_sessions_per_unit,
      frequencyUnit: row.money_frequency_unit,
    },
  };
}

function periodFromRow(row: PeriodRow): Period {
  if (row.end_reason !== null && row.end_reason !== "relapse") {
    throw new DataCorruptionError("unknown period end reason");
  }
  if ((row.ended_at === null) !== (row.end_reason === null)) {
    throw new DataCorruptionError("period end and reason disagree");
  }
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    endReason: row.end_reason,
  };
}

function relapseFromRow(row: RelapseRow): RelapseEvent {
  return {
    id: row.id,
    periodId: row.period_id,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    contributingFactors: parseJsonArray(row.contributing_factors, "contributing_factors", isString),
    note: row.note,
  };
}

function urgeFromRow(row: UrgeRow): UrgeEvent {
  if (row.outcome !== "resisted" && row.outcome !== "acted") {
    throw new DataCorruptionError("unknown urge outcome");
  }
  return {
    id: row.id,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    intensity: row.intensity,
    trigger: row.trigger_tag,
    durationMinutes: row.duration_minutes,
    copingActions: parseJsonArray(row.coping_actions, "coping_actions", isString),
    outcome: row.outcome,
    note: row.note,
  };
}

export function journeyParams(j: Journey): SqlValue[] {
  return [
    j.id,
    j.categoryId,
    j.createdAt,
    JSON.stringify(j.milestoneHours),
    j.money.enabled ? 1 : 0,
    j.money.currency,
    j.money.amountPerSessionMinor,
    j.money.sessionsPerUnit,
    j.money.frequencyUnit,
  ];
}

export const periodParams = (journeyId: string, p: Period): SqlValue[] => [
  p.id,
  journeyId,
  p.startedAt,
  p.endedAt,
  p.endReason,
];

export const relapseParams = (journeyId: string, r: RelapseEvent): SqlValue[] => [
  r.id,
  journeyId,
  r.periodId,
  r.occurredAt,
  r.recordedAt,
  JSON.stringify(r.contributingFactors),
  r.note,
];

export const urgeParams = (journeyId: string, u: UrgeEvent): SqlValue[] => [
  u.id,
  journeyId,
  u.occurredAt,
  u.recordedAt,
  u.intensity,
  u.trigger,
  u.durationMinutes,
  JSON.stringify(u.copingActions),
  u.outcome,
  u.note,
];
