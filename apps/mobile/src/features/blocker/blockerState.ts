import { err, MS_PER_DAY, ok, type Instant, type Result } from "@free/core";

/**
 * State of the paid site blocker (D-030, docs/architecture/site-blocker.md). Pure: the
 * platform layer starts and stops the actual filter, the purchase is verified with the store.
 *
 * A commitment period keeps the switch off-limits inside Free until it ends. It relies on the
 * device clock and the operating system can always stop a VPN: it is a help, not a lock.
 */
export interface BlockerState {
  purchased: boolean;
  enabled: boolean;
  /** While set and in the future, Free does not offer to turn the blocker off. */
  commitmentEndsAt: Instant | null;
}

export const BLOCKER_SETTINGS_KEY = "site_blocker";
export const COMMITMENT_DAYS = [1, 7, 30, 90] as const;
export type CommitmentDays = (typeof COMMITMENT_DAYS)[number];

export const DEFAULT_BLOCKER_STATE: BlockerState = {
  purchased: false,
  enabled: false,
  commitmentEndsAt: null,
};

export type EnableError = "not_purchased";
export type DisableError = "not_enabled" | "in_commitment";

export function enableBlocker(
  state: BlockerState,
  commitmentDays: CommitmentDays | null,
  now: Instant,
): Result<BlockerState, EnableError> {
  if (!state.purchased) return err("not_purchased");
  const requested = commitmentDays === null ? null : now + commitmentDays * MS_PER_DAY;
  // Turning it on again never shortens a commitment already running.
  const current = isCommitted(state, now) ? state.commitmentEndsAt : null;
  const commitmentEndsAt =
    requested === null ? current : current === null ? requested : Math.max(current, requested);
  return ok({ ...state, enabled: true, commitmentEndsAt });
}

export function isCommitted(state: BlockerState, now: Instant): boolean {
  return state.enabled && state.commitmentEndsAt !== null && now < state.commitmentEndsAt;
}

export function disableBlocker(
  state: BlockerState,
  now: Instant,
): Result<BlockerState, DisableError> {
  if (!state.enabled) return err("not_enabled");
  if (isCommitted(state, now)) return err("in_commitment");
  return ok({ ...state, enabled: false, commitmentEndsAt: null });
}

export function remainingCommitmentMs(state: BlockerState, now: Instant): number {
  return isCommitted(state, now) && state.commitmentEndsAt !== null
    ? state.commitmentEndsAt - now
    : 0;
}

export function serializeBlockerState(state: BlockerState): string {
  return JSON.stringify(state);
}

/** Anything unreadable falls back to "not purchased, off": the store purchase is re-checked. */
export function deserializeBlockerState(raw: string | null): BlockerState {
  if (raw === null) return DEFAULT_BLOCKER_STATE;
  try {
    const value = JSON.parse(raw) as Partial<BlockerState>;
    const ends = value.commitmentEndsAt;
    return {
      purchased: value.purchased === true,
      enabled: value.enabled === true,
      commitmentEndsAt: typeof ends === "number" && Number.isFinite(ends) ? ends : null,
    };
  } catch {
    return DEFAULT_BLOCKER_STATE;
  }
}
