import { CATEGORIES, type CategoryId } from "./categories";
import {
  MAX_INTENSITY,
  MAX_NOTE_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_URGE_DURATION_MINUTES,
  MIN_INTENSITY,
} from "./journey";
import { normalizeMilestones } from "./milestones";
import { validateMoneySettings, type FrequencyUnit, type MoneySettings } from "./money";
import { err, ok, type Result } from "./result";
import { isValidInstant } from "./time";
import type { Journey, Period, RelapseEvent, UrgeEvent } from "./types";

/**
 * Validates untrusted data (e.g. an imported backup file) against every Journey invariant.
 * Returns a fresh, typed object; nothing from the input is trusted by reference.
 */
export type JourneyValidationError = "invalid_journey";

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isInstant = (v: unknown): v is number => typeof v === "number" && isValidInstant(v);
const nullable = <T>(v: unknown, guard: (x: unknown) => x is T): v is T | null =>
  v === null || guard(v);
const isNote = (v: unknown): v is string | null =>
  v === null || (isStr(v) && v.length <= MAX_NOTE_LENGTH);
const isTags = (v: unknown): v is string[] =>
  Array.isArray(v) &&
  v.length <= MAX_TAGS &&
  v.every((t) => isStr(t) && t.length > 0 && t.length <= MAX_TAG_LENGTH);

class Invalid extends Error {}
function check(condition: boolean): asserts condition {
  if (!condition) throw new Invalid();
}

function parsePeriod(v: unknown): Period {
  check(isObj(v) && isStr(v.id) && isInstant(v.startedAt));
  check(nullable(v.endedAt, isInstant));
  check(v.endReason === null || v.endReason === "relapse");
  check((v.endedAt === null) === (v.endReason === null));
  check(v.endedAt === null || v.endedAt >= v.startedAt);
  return { id: v.id, startedAt: v.startedAt, endedAt: v.endedAt, endReason: v.endReason };
}

function parseRelapse(v: unknown): RelapseEvent {
  check(isObj(v) && isStr(v.id) && isStr(v.periodId) && isInstant(v.occurredAt));
  check(isInstant(v.recordedAt) && isTags(v.contributingFactors) && isNote(v.note));
  return {
    id: v.id,
    periodId: v.periodId,
    occurredAt: v.occurredAt,
    recordedAt: v.recordedAt,
    contributingFactors: [...v.contributingFactors],
    note: v.note,
  };
}

function parseUrge(v: unknown): UrgeEvent {
  check(isObj(v) && isStr(v.id) && isInstant(v.occurredAt) && isInstant(v.recordedAt));
  check(
    typeof v.intensity === "number" &&
      Number.isInteger(v.intensity) &&
      v.intensity >= MIN_INTENSITY &&
      v.intensity <= MAX_INTENSITY,
  );
  check(nullable(v.trigger, isStr) && isTags(v.copingActions) && isNote(v.note));
  check(
    v.durationMinutes === null ||
      (typeof v.durationMinutes === "number" &&
        Number.isInteger(v.durationMinutes) &&
        v.durationMinutes >= 0 &&
        v.durationMinutes <= MAX_URGE_DURATION_MINUTES),
  );
  check(v.outcome === "resisted" || v.outcome === "acted");
  return {
    id: v.id,
    occurredAt: v.occurredAt,
    recordedAt: v.recordedAt,
    intensity: v.intensity,
    trigger: v.trigger,
    durationMinutes: v.durationMinutes,
    copingActions: [...v.copingActions],
    outcome: v.outcome,
    note: v.note,
  };
}

const FREQUENCY_UNITS: readonly string[] = ["day", "week", "month"];

function parseMoney(v: unknown): MoneySettings {
  check(isObj(v) && typeof v.enabled === "boolean" && isStr(v.currency));
  check(nullable(v.amountPerSessionMinor, (x): x is number => typeof x === "number"));
  check(nullable(v.sessionsPerUnit, (x): x is number => typeof x === "number"));
  check(isStr(v.frequencyUnit) && FREQUENCY_UNITS.includes(v.frequencyUnit));
  const money: MoneySettings = {
    enabled: v.enabled,
    currency: v.currency,
    amountPerSessionMinor: v.amountPerSessionMinor,
    sessionsPerUnit: v.sessionsPerUnit,
    frequencyUnit: v.frequencyUnit as FrequencyUnit,
  };
  check(validateMoneySettings(money).ok);
  return money;
}

export function parseJourney(input: unknown): Result<Journey, JourneyValidationError> {
  try {
    check(isObj(input) && isStr(input.id) && isInstant(input.createdAt));
    check(isStr(input.categoryId) && Object.hasOwn(CATEGORIES, input.categoryId));
    check(
      Array.isArray(input.periods) && Array.isArray(input.relapses) && Array.isArray(input.urges),
    );
    check(Array.isArray(input.milestoneHours));
    const periods = input.periods.map(parsePeriod);
    check(
      periods.length > 0 && periods.findIndex((p) => p.endedAt === null) === periods.length - 1,
    );
    for (let i = 1; i < periods.length; i++) {
      const previous = periods[i - 1];
      const current = periods[i];
      check(
        previous?.endedAt != null && current !== undefined && current.startedAt >= previous.endedAt,
      );
    }
    const relapses = input.relapses.map(parseRelapse);
    const periodIds = new Set(periods.map((p) => p.id));
    check(periodIds.size === periods.length && relapses.every((r) => periodIds.has(r.periodId)));
    const urges = input.urges.map(parseUrge);
    const ids = [...relapses.map((r) => r.id), ...urges.map((u) => u.id)];
    check(new Set(ids).size === ids.length);
    const milestones = normalizeMilestones(
      input.milestoneHours.filter((h): h is number => typeof h === "number"),
    );
    check(milestones.ok && milestones.value.length === input.milestoneHours.length);
    return ok({
      id: input.id,
      categoryId: input.categoryId as CategoryId,
      createdAt: input.createdAt,
      periods,
      relapses,
      urges,
      milestoneHours: milestones.value,
      money: parseMoney(input.money),
    });
  } catch (e) {
    if (e instanceof Invalid) return err("invalid_journey");
    throw e;
  }
}
