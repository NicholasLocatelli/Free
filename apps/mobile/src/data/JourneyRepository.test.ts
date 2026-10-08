/**
 * @jest-environment node
 */
import { recordRelapse, recordUrge, updateMilestones, type Journey } from "@free/core";
import { DAY, newJourney, T0 } from "../test/fixtures";
import { createNodeSqlExecutor } from "../test/nodeSqlExecutor";
import { createJourneyRepository } from "./JourneyRepository";
import { migrate } from "./migrations";
import { DataCorruptionError } from "./rows";
import { createSettingsRepository } from "./SettingsRepository";

function unwrap(result: { ok: true; value: Journey } | { ok: false; error: string }): Journey {
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

async function setup() {
  const db = createNodeSqlExecutor();
  await migrate(db);
  return { db, repo: createJourneyRepository(db) };
}

function withHistory(): Journey {
  const start = newJourney();
  const urged = unwrap(
    recordUrge(start, {
      id: "urge-1",
      occurredAt: T0 + DAY,
      intensity: 8,
      trigger: "boredom",
      durationMinutes: 15,
      copingActions: ["breathing", "called_someone"],
      outcome: "resisted",
      note: "serata difficile",
      now: T0 + DAY,
    }),
  );
  return unwrap(
    recordRelapse(urged, {
      relapseId: "relapse-1",
      newPeriodId: "period-2",
      occurredAt: T0 + 10 * DAY,
      contributingFactors: ["stress"],
      note: "giorno di paga",
      now: T0 + 10 * DAY,
    }),
  );
}

describe("JourneyRepository", () => {
  it("returns null before onboarding", async () => {
    const { repo } = await setup();
    expect(await repo.load()).toBeNull();
  });

  it("round-trips a journey exactly", async () => {
    const { repo } = await setup();
    const journey = newJourney();
    await repo.save(journey, null);
    expect(await repo.load()).toEqual(journey);
  });

  it("persists relapses and urges incrementally, preserving history", async () => {
    const { repo } = await setup();
    const start = newJourney();
    await repo.save(start, null);
    const next = withHistory();
    await repo.save(next, start);
    expect(await repo.load()).toEqual(next);
  });

  it("persists setting changes", async () => {
    const { repo } = await setup();
    const start = newJourney();
    await repo.save(start, null);
    const next = unwrap(updateMilestones(start, [12, 48]));
    await repo.save(next, start);
    expect((await repo.load())?.milestoneHours).toEqual([12, 48]);
  });

  it("is atomic: a failure mid-save persists nothing (REL-9)", async () => {
    const { db, repo } = await setup();
    const start = newJourney();
    await repo.save(start, null);
    const next = withHistory();
    // A conflicting relapse id makes the save fail AFTER the period updates/inserts ran.
    await db.run(
      "INSERT INTO relapses (id, journey_id, period_id, occurred_at, recorded_at) VALUES ('relapse-1', 'journey-1', 'period-1', 0, 0)",
    );
    await expect(repo.save(next, start)).rejects.toThrow();
    await db.run("DELETE FROM relapses WHERE id = 'relapse-1'");
    expect(await repo.load()).toEqual(start);
  });

  it("enforces a single open period at the database level", async () => {
    const { db, repo } = await setup();
    await repo.save(newJourney(), null);
    await expect(
      db.run("INSERT INTO periods (id, journey_id, started_at) VALUES ('p-extra', 'journey-1', 0)"),
    ).rejects.toThrow();
  });

  it("enforces value constraints", async () => {
    const { db, repo } = await setup();
    await repo.save(newJourney(), null);
    await expect(
      db.run(
        "INSERT INTO urges (id, journey_id, occurred_at, recorded_at, intensity, outcome) VALUES ('u', 'journey-1', 0, 0, 11, 'resisted')",
      ),
    ).rejects.toThrow();
  });

  it.each([
    ["invalid JSON", "UPDATE journeys SET milestone_hours = 'not json'"],
    ["wrong JSON shape", "UPDATE journeys SET milestone_hours = '[\"x\"]'"],
    ["unknown category", "UPDATE journeys SET category_id = 'poker'"],
    ["no open period", "UPDATE periods SET ended_at = started_at, end_reason = 'relapse'"],
    ["inconsistent period end", "UPDATE periods SET end_reason = 'relapse'"],
  ])("reports corrupted data (%s) instead of loading it", async (_label, corruption) => {
    const { db, repo } = await setup();
    await repo.save(newJourney(), null);
    await db.exec(`PRAGMA ignore_check_constraints = ON; ${corruption}`);
    await expect(repo.load()).rejects.toBeInstanceOf(DataCorruptionError);
  });

  it("deletes all data, including settings", async () => {
    const { db, repo } = await setup();
    const settings = createSettingsRepository(db);
    await repo.save(withHistory(), null);
    await settings.set("theme", "dark");
    await repo.deleteAll();
    expect(await repo.load()).toBeNull();
    expect(await settings.get("theme")).toBeNull();
    for (const table of ["periods", "relapses", "urges"]) {
      expect(await db.all(`SELECT * FROM ${table}`)).toEqual([]);
    }
  });
});

describe("SettingsRepository", () => {
  it("stores and overwrites values", async () => {
    const { db } = await setup();
    const settings = createSettingsRepository(db);
    expect(await settings.get("theme")).toBeNull();
    await settings.set("theme", "dark");
    await settings.set("theme", "light");
    expect(await settings.get("theme")).toBe("light");
  });
});
