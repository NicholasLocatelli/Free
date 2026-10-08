import {
  createJourney,
  editCurrentPeriodStart,
  err,
  ok,
  recordRelapse,
  recordUrge,
  updateMilestones,
  updateMoneySettings,
  type CreateJourneyError,
  type CreateJourneyInput,
  type EditStartError,
  type Instant,
  type Journey,
  type MoneySettings,
  type RecordRelapseError,
  type RecordRelapseInput,
  type RecordUrgeError,
  type RecordUrgeInput,
  type Result,
} from "@free/core";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { JourneyRepository } from "../data/JourneyRepository";

export type BootStatus =
  { status: "loading" } | { status: "ready" } | { status: "error"; error: Error };

/** Domain errors plus the two the app layer can add. */
export type CommandError<E extends string> = E | "no_journey" | "persist_failed";
export type CommandResult<E extends string> = Result<Journey, CommandError<E>>;

export interface JourneyStoreDeps {
  repository: JourneyRepository;
  now: () => Instant;
  newId: () => string;
}

type StartInput = Omit<CreateJourneyInput, "id" | "periodId" | "now">;
type RelapseInput = Omit<RecordRelapseInput, "relapseId" | "newPeriodId" | "now">;
/** `id` is optional so a form can generate it once when it opens (double-submit guard). */
type UrgeInput = Omit<RecordUrgeInput, "id" | "now"> & { id?: string };

export interface JourneyState {
  boot: BootStatus;
  /** Cache of what is persisted; null before onboarding. Updated only after a commit. */
  journey: Journey | null;
  // Function-typed properties (not methods) so selectors can pass them around unbound.
  load: () => Promise<void>;
  start: (input: StartInput) => Promise<CommandResult<CreateJourneyError>>;
  recordRelapse: (input: RelapseInput) => Promise<CommandResult<RecordRelapseError>>;
  recordUrge: (input: UrgeInput) => Promise<CommandResult<RecordUrgeError>>;
  editCurrentPeriodStart: (startedAt: Instant) => Promise<CommandResult<EditStartError>>;
  updateMoney: (money: MoneySettings) => Promise<CommandResult<"invalid_money_settings">>;
  updateMilestones: (hours: readonly number[]) => Promise<CommandResult<"invalid_milestones">>;
  deleteAll: () => Promise<Result<null, "persist_failed">>;
}

export type JourneyStore = StoreApi<JourneyState>;

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

export function createJourneyStore({ repository, now, newId }: JourneyStoreDeps): JourneyStore {
  // Commands run one at a time so each one starts from the state the previous committed.
  let queue: Promise<unknown> = Promise.resolve();
  const serial = <T>(task: () => Promise<T>): Promise<T> => {
    const next = queue.then(task, task);
    queue = next.catch(() => undefined);
    return next;
  };

  return createStore<JourneyState>()((set, get) => {
    const commit = async <E extends string>(
      compute: (previous: Journey | null, at: Instant) => Result<Journey, CommandError<E>>,
    ): Promise<CommandResult<E>> =>
      serial(async () => {
        const previous = get().journey;
        const result = compute(previous, now());
        if (!result.ok) return result;
        try {
          await repository.save(result.value, previous);
        } catch {
          return err("persist_failed");
        }
        set({ journey: result.value });
        return result;
      });

    const withJourney =
      <E extends string>(command: (journey: Journey, at: Instant) => Result<Journey, E>) =>
      (previous: Journey | null, at: Instant): Result<Journey, CommandError<E>> =>
        previous ? command(previous, at) : err("no_journey");

    return {
      boot: { status: "loading" },
      journey: null,

      load: () =>
        serial(async () => {
          set({ boot: { status: "loading" } });
          try {
            const journey = await repository.load();
            set({ journey, boot: { status: "ready" } });
          } catch (e) {
            set({ boot: { status: "error", error: toError(e) } });
          }
        }),

      start: (input) =>
        commit<CreateJourneyError>((_previous, at) =>
          createJourney({ ...input, id: newId(), periodId: newId(), now: at }),
        ),

      recordRelapse: (input) =>
        commit(
          withJourney((journey, at) =>
            recordRelapse(journey, { ...input, relapseId: newId(), newPeriodId: newId(), now: at }),
          ),
        ),

      recordUrge: ({ id, ...input }) =>
        commit(
          withJourney((journey, at) =>
            recordUrge(journey, { ...input, id: id ?? newId(), now: at }),
          ),
        ),

      editCurrentPeriodStart: (startedAt) =>
        commit(withJourney((journey, at) => editCurrentPeriodStart(journey, startedAt, at))),

      updateMoney: (money) => commit(withJourney((journey) => updateMoneySettings(journey, money))),

      updateMilestones: (hours) =>
        commit(withJourney((journey) => updateMilestones(journey, hours))),

      deleteAll: () =>
        serial(async () => {
          try {
            await repository.deleteAll();
          } catch {
            return err("persist_failed");
          }
          set({ journey: null });
          return ok(null);
        }),
    };
  });
}
