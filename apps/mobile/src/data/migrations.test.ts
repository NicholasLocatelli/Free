/**
 * @jest-environment node
 */
import { createNodeSqlExecutor } from "../test/nodeSqlExecutor";
import { LATEST_SCHEMA_VERSION, migrate, SchemaTooNewError, schemaVersion } from "./migrations";

describe("migrate", () => {
  it("creates the latest schema on an empty database", async () => {
    const db = createNodeSqlExecutor();
    expect(await migrate(db)).toBe(LATEST_SCHEMA_VERSION);
    const tables = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    expect(tables.map((t) => t.name)).toEqual([
      "app_settings",
      "journeys",
      "periods",
      "relapses",
      "urges",
    ]);
  });

  it("is idempotent", async () => {
    const db = createNodeSqlExecutor();
    await migrate(db);
    expect(await migrate(db)).toBe(LATEST_SCHEMA_VERSION);
  });
});

describe("migrate failures", () => {
  it("rolls back a failing migration and keeps the previous version", async () => {
    const db = createNodeSqlExecutor();
    const broken = [
      "CREATE TABLE a (id TEXT PRIMARY KEY);",
      "CREATE TABLE b (id TEXT PRIMARY KEY); INSERT INTO missing_table VALUES (1);",
    ];
    await expect(migrate(db, broken)).rejects.toThrow();
    expect(await schemaVersion(db)).toBe(1);
    const tables = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table'",
    );
    expect(tables.map((t) => t.name)).toEqual(["a"]);
  });

  it("refuses a database created by a newer app version", async () => {
    const db = createNodeSqlExecutor();
    await db.exec(`PRAGMA user_version = ${LATEST_SCHEMA_VERSION + 1}`);
    await expect(migrate(db)).rejects.toBeInstanceOf(SchemaTooNewError);
  });
});
