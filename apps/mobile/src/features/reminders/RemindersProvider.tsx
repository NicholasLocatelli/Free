import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PermissionState, ReminderScheduler } from "../../platform/notifications";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { useSettings } from "../../state/SettingsProvider";
import {
  anyReminderEnabled,
  DEFAULT_REMINDER_PREFS,
  deserializePrefs,
  planReminders,
  REMINDER_SETTINGS_KEY,
  serializePrefs,
  type ReminderPrefs,
} from "./reminderPlan";

export type UpdateResult = "saved" | "permission_denied";

interface RemindersContextValue {
  prefs: ReminderPrefs;
  loaded: boolean;
  /** Saves prefs; asks for permission only when a reminder is being switched on. */
  update: (next: ReminderPrefs) => Promise<UpdateResult>;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

interface RemindersProviderProps {
  scheduler: ReminderScheduler;
  children: ReactNode;
  now?: () => number;
}

/**
 * Keeps scheduled notifications in sync with the journey and the user's choices. Every
 * change re-plans from scratch (replaceAll), one sync at a time, so no duplicates survive.
 */
export function RemindersProvider({ scheduler, children, now = Date.now }: RemindersProviderProps) {
  const settings = useSettings();
  const journey = useJourneyStore((s) => s.journey);
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_REMINDER_PREFS);
  const [loaded, setLoaded] = useState(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    settings
      .get(REMINDER_SETTINGS_KEY)
      .catch(() => null)
      .then((raw) => {
        if (!active) return;
        setPrefs(deserializePrefs(raw));
        setLoaded(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [settings]);

  useEffect(() => {
    if (!loaded) return;
    const sync = async () => {
      if (!anyReminderEnabled(prefs)) {
        await scheduler.replaceAll([]);
        return;
      }
      const permission: PermissionState = await scheduler.getPermission();
      await scheduler.replaceAll(
        permission === "granted" ? planReminders(journey, prefs, now()) : [],
      );
    };
    // Best effort: a failed sync must never break the app; the next change retries.
    queue.current = queue.current.then(sync, sync).catch(() => undefined);
  }, [loaded, prefs, journey, scheduler, now]);

  const update = useCallback(
    async (next: ReminderPrefs): Promise<UpdateResult> => {
      const switchingOn =
        (next.checkInEnabled && !prefs.checkInEnabled) ||
        (next.milestonesEnabled && !prefs.milestonesEnabled);
      let result: UpdateResult = "saved";
      let effective = next;
      if (switchingOn) {
        const current = await scheduler.getPermission();
        const permission = current === "granted" ? current : await scheduler.requestPermission();
        if (permission !== "granted") {
          effective = {
            ...next,
            checkInEnabled: prefs.checkInEnabled,
            milestonesEnabled: prefs.milestonesEnabled,
          };
          result = "permission_denied";
        }
      }
      setPrefs(effective);
      await settings.set(REMINDER_SETTINGS_KEY, serializePrefs(effective)).catch(() => undefined);
      return result;
    },
    [prefs, scheduler, settings],
  );

  const value = useMemo(() => ({ prefs, loaded, update }), [prefs, loaded, update]);
  return <RemindersContext value={value}>{children}</RemindersContext>;
}

export function useReminders(): RemindersContextValue {
  const context = useContext(RemindersContext);
  if (!context) throw new Error("useReminders must be used inside <RemindersProvider>");
  return context;
}
