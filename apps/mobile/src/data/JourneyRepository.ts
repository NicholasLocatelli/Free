import type { Journey, Period } from "@free/core";
import {
  journeyFromRows,
  journeyParams,
  periodParams,
  relapseParams,
  urgeParams,
  type JourneyRow,
  type PeriodRow,
  type RelapseRow,
  type UrgeRow,
} from "./rows";
import type { SqlExecutor } from "./SqlExecutor";

const UPSERT_JOURNEY = `
  INSERT INTO journeys (id, category_id, created_at, milestone_hours, money_enabled,
    money_currency, money_amount_minor, money_sessions_per_unit, money_frequency_unit)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    milestone_hours = excluded.milestone_hours,
    money_enabled = excluded.money_enabled,
    money_currency = excluded.money_currency,
    money_amount_minor = excluded.money_amount_minor,
    money_sessions_per_unit = excluded.money_sessions_per_unit,
    money_frequency_unit = excluded.money_frequency_unit`;

const INSERT_PERIOD =
  "INSERT INTO periods (id, journey_id, started_at, ended_at, end_reason) VALUES (?, ?, ?, ?, ?)";
const UPDATE_PERIOD =
  "UPDATE periods SET started_at = ?, ended_at = ?, end_reason = ? WHERE id = ?";
const INSERT_RELAPSE = `INSERT INTO relapses
  (id, journey_id, period_id, occurred_at, recorded_at, contributing_factors, note)
  VALUES (?, ?, ?, ?, ?, ?, ?)`;
const INSERT_URGE = `INSERT INTO urges
  (id, journey_id, occurred_at, recorded_at, intensity, trigger_tag, duration_minutes,
   coping_actions, outcome, note)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const samePeriod = (a: Period, b: Period) =>
  a.startedAt === b.startedAt && a.endedAt === b.endedAt && a.endReason === b.endReason;

export interface JourneyRepository {
  /** The single journey of the MVP, or null before onboarding. */
  load(): Promise<Journey | null>;
  /**
   * Persists the difference between `previous` (what is stored) and `next` in ONE
   * transaction. History is append-only: events are inserted, never updated or deleted.
   */
  save(next: Journey, previous: Journey | null): Promise<void>;
  deleteAll(): Promise<void>;
}

export function createJourneyRepository(db: SqlExecutor): JourneyRepository {
  return {
    async load() {
      const journeys = await db.all<JourneyRow>(
        "SELECT * FROM journeys ORDER BY created_at LIMIT 1",
      );
      const row = journeys[0];
      if (!row) return null;
      const [periods, relapses, urges] = await Promise.all([
        db.all<PeriodRow>("SELECT * FROM periods WHERE journey_id = ? ORDER BY started_at, rowid", [
          row.id,
        ]),
        db.all<RelapseRow>(
          "SELECT * FROM relapses WHERE journey_id = ? ORDER BY occurred_at, rowid",
          [row.id],
        ),
        db.all<UrgeRow>("SELECT * FROM urges WHERE journey_id = ? ORDER BY occurred_at, rowid", [
          row.id,
        ]),
      ]);
      return journeyFromRows(row, periods, relapses, urges);
    },

    async save(next, previous) {
      const oldPeriods = new Map(previous?.periods.map((p) => [p.id, p]));
      const oldRelapses = new Set(previous?.relapses.map((r) => r.id));
      const oldUrges = new Set(previous?.urges.map((u) => u.id));

      await db.transaction(async (tx) => {
        await tx.run(UPSERT_JOURNEY, journeyParams(next));
        // Close/edit existing periods before inserting new ones, so the
        // "one open period" index never sees two open rows.
        for (const period of next.periods) {
          const old = oldPeriods.get(period.id);
          if (old && !samePeriod(old, period)) {
            await tx.run(UPDATE_PERIOD, [
              period.startedAt,
              period.endedAt,
              period.endReason,
              period.id,
            ]);
          }
        }
        for (const period of next.periods) {
          if (!oldPeriods.has(period.id)) {
            await tx.run(INSERT_PERIOD, periodParams(next.id, period));
          }
        }
        for (const relapse of next.relapses) {
          if (!oldRelapses.has(relapse.id)) {
            await tx.run(INSERT_RELAPSE, relapseParams(next.id, relapse));
          }
        }
        for (const urge of next.urges) {
          if (!oldUrges.has(urge.id)) await tx.run(INSERT_URGE, urgeParams(next.id, urge));
        }
      });
    },

    async deleteAll() {
      await db.transaction(async (tx) => {
        await tx.run("DELETE FROM journeys");
        await tx.run("DELETE FROM app_settings");
      });
      // Reclaim pages so deleted content does not linger in the file.
      await db.exec("VACUUM");
    },
  };
}
