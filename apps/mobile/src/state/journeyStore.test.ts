/**
 * @jest-environment node
 */
import { createJourneyRepository, type JourneyRepository } from "../data/JourneyRepository";
import { migrate } from "../data/migrations";
import { DAY, idSequence, T0 } from "../test/fixtures";
import { createNodeSqlExecutor } from "../test/nodeSqlExecutor";
import { createJourneyStore } from "./journeyStore";

async function setup(repositoryOverride?: Partial<JourneyRepository>) {
  const db = createNodeSqlExecutor();
  await migrate(db);
  const repository = { ...createJourneyRepository(db), ...repositoryOverride };
  let now = T0;
  const store = createJourneyStore({ repository, now: () => now, newId: idSequence() });
  await store.getState().load();
  return {
    store,
    repository,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe("journeyStore", () => {
  it("boots empty before onboarding", async () => {
    const { store } = await setup();
    expect(store.getState().boot).toEqual({ status: "ready" });
    expect(store.getState().journey).toBeNull();
  });

  it("starts a journey and persists it", async () => {
    const { store, repository } = await setup();
    const result = await store.getState().start({ categoryId: "gambling", startedAt: T0 - DAY });
    expect(result.ok).toBe(true);
    expect(await repository.load()).toEqual(store.getState().journey);
  });

  it("records a relapse that survives a restart (reload from disk)", async () => {
    const { store, repository, advance } = await setup();
    await store.getState().start({ categoryId: "gambling", startedAt: T0 });
    advance(10 * DAY);
    const result = await store.getState().recordRelapse({ occurredAt: T0 + 10 * DAY });
    expect(result.ok).toBe(true);

    const reloaded = await repository.load();
    expect(reloaded?.periods).toHaveLength(2);
    expect(reloaded).toEqual(store.getState().journey);
  });

  it("returns domain errors without touching state or disk", async () => {
    const { store, repository } = await setup();
    await store.getState().start({ categoryId: "gambling", startedAt: T0 });
    const before = store.getState().journey;
    const result = await store
      .getState()
      .recordUrge({ occurredAt: T0, intensity: 0, outcome: "resisted" });
    expect(result).toEqual({ ok: false, error: "invalid_intensity" });
    expect(store.getState().journey).toBe(before);
    expect(await repository.load()).toEqual(before);
  });

  it("keeps the previous state when saving fails", async () => {
    let failSaves = false;
    const db = createNodeSqlExecutor();
    await migrate(db);
    const real = createJourneyRepository(db);
    const repository: JourneyRepository = {
      ...real,
      save: (next, previous) =>
        failSaves ? Promise.reject(new Error("disk full")) : real.save(next, previous),
    };
    const store = createJourneyStore({ repository, now: () => T0, newId: idSequence() });
    await store.getState().load();
    await store.getState().start({ categoryId: "gambling", startedAt: T0 });
    const before = store.getState().journey;

    failSaves = true;
    expect(await store.getState().recordRelapse({ occurredAt: T0 })).toEqual({
      ok: false,
      error: "persist_failed",
    });
    expect(store.getState().journey).toBe(before);
    expect(await real.load()).toEqual(before);
  });

  it("rejects commands before onboarding", async () => {
    const { store } = await setup();
    expect(await store.getState().recordRelapse({ occurredAt: T0 })).toEqual({
      ok: false,
      error: "no_journey",
    });
  });

  it("serialises concurrent commands so none is lost", async () => {
    const { store, repository } = await setup();
    await store.getState().start({ categoryId: "gambling", startedAt: T0 });
    await Promise.all([
      store.getState().recordUrge({ occurredAt: T0, intensity: 5, outcome: "resisted" }),
      store.getState().recordUrge({ occurredAt: T0, intensity: 6, outcome: "resisted" }),
    ]);
    expect(store.getState().journey?.urges).toHaveLength(2);
    expect((await repository.load())?.urges).toHaveLength(2);
  });

  it("ignores a double submit carrying the same urge id", async () => {
    const { store } = await setup();
    await store.getState().start({ categoryId: "gambling", startedAt: T0 });
    const input = { id: "form-1", occurredAt: T0, intensity: 5, outcome: "resisted" as const };
    await store.getState().recordUrge(input);
    expect(await store.getState().recordUrge(input)).toEqual({ ok: false, error: "duplicate_id" });
    expect(store.getState().journey?.urges).toHaveLength(1);
  });

  it("supports settings commands", async () => {
    const { store } = await setup();
    await store.getState().start({ categoryId: "gambling", startedAt: T0 });
    expect((await store.getState().updateMilestones([48, 12])).ok).toBe(true);
    expect((await store.getState().editCurrentPeriodStart(T0 - DAY)).ok).toBe(true);
    const current = store.getState().journey;
    if (!current) throw new Error("journey missing");
    const money = { ...current.money, enabled: true };
    expect(await store.getState().updateMoney(money)).toEqual({
      ok: false,
      error: "invalid_money_settings",
    });
  });

  it("deletes everything and returns to onboarding", async () => {
    const { store, repository } = await setup();
    await store.getState().start({ categoryId: "gambling", startedAt: T0 });
    expect(await store.getState().deleteAll()).toEqual({ ok: true, value: null });
    expect(store.getState().journey).toBeNull();
    expect(await repository.load()).toBeNull();
  });

  it("exposes load failures as an error state", async () => {
    const { store } = await setup({ load: () => Promise.reject(new Error("corrupt")) });
    expect(store.getState().boot).toMatchObject({ status: "error" });
  });
});
