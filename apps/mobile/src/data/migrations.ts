import type { SqlExecutor } from "./SqlExecutor";

/**
 * Ordered schema migrations; index + 1 is the resulting `PRAGMA user_version`.
 * Never edit a released migration: append a new one. Schema doc: docs/architecture/data-model.md.
 */
export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE journeys (
    id                       TEXT PRIMARY KEY,
    category_id              TEXT NOT NULL,
    created_at               INTEGER NOT NULL,
    milestone_hours          TEXT NOT NULL,
    money_enabled            INTEGER NOT NULL DEFAULT 0 CHECK (money_enabled IN (0, 1)),
    money_currency           TEXT NOT NULL DEFAULT 'EUR',
    money_amount_minor       INTEGER,
    money_sessions_per_unit  REAL,
    money_frequency_unit     TEXT NOT NULL DEFAULT 'week'
                             CHECK (money_frequency_unit IN ('day', 'week', 'month'))
  );

  CREATE TABLE periods (
    id          TEXT PRIMARY KEY,
    journey_id  TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    started_at  INTEGER NOT NULL,
    ended_at    INTEGER,
    end_reason  TEXT CHECK (end_reason IN ('relapse')),
    CHECK (ended_at IS NULL OR ended_at >= started_at)
  );
  CREATE UNIQUE INDEX one_open_period_per_journey ON periods(journey_id) WHERE ended_at IS NULL;
  CREATE INDEX periods_by_journey ON periods(journey_id, started_at);

  CREATE TABLE relapses (
    id                   TEXT PRIMARY KEY,
    journey_id           TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    period_id            TEXT NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
    occurred_at          INTEGER NOT NULL,
    recorded_at          INTEGER NOT NULL,
    contributing_factors TEXT NOT NULL DEFAULT '[]',
    note                 TEXT
  );

  CREATE TABLE urges (
    id                TEXT PRIMARY KEY,
    journey_id        TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    occurred_at       INTEGER NOT NULL,
    recorded_at       INTEGER NOT NULL,
    intensity         INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
    trigger_tag       TEXT,
    duration_minutes  INTEGER CHECK (duration_minutes BETWEEN 0 AND 1440),
    coping_actions    TEXT NOT NULL DEFAULT '[]',
    outcome           TEXT NOT NULL CHECK (outcome IN ('resisted', 'acted')),
    note              TEXT
  );
  CREATE INDEX urges_by_journey ON urges(journey_id, occurred_at);

  CREATE TABLE app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
];

export const LATEST_SCHEMA_VERSION = MIGRATIONS.length;

export class SchemaTooNewError extends Error {
  constructor(found: number) {
    super(`Database schema v${found} is newer than this app (v${LATEST_SCHEMA_VERSION}).`);
    this.name = "SchemaTooNewError";
  }
}

export async function schemaVersion(db: SqlExecutor): Promise<number> {
  const [row] = await db.all<{ user_version: number }>("PRAGMA user_version");
  return row?.user_version ?? 0;
}

/**
 * Applies pending migrations one transaction at a time. A failing migration rolls back
 * completely and leaves the previous version intact (never a half-migrated schema).
 */
export async function migrate(
  db: SqlExecutor,
  migrations: readonly string[] = MIGRATIONS,
): Promise<number> {
  await db.exec("PRAGMA foreign_keys = ON");
  let version = await schemaVersion(db);
  if (version > migrations.length) throw new SchemaTooNewError(version);
  for (; version < migrations.length; version++) {
    const sql = migrations[version] ?? "";
    const next = version + 1;
    await db.transaction(async (tx) => {
      await tx.exec(sql);
      await tx.exec(`PRAGMA user_version = ${next}`);
    });
  }
  return version;
}
