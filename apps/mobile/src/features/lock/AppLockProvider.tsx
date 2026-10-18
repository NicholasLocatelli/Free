import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState, StyleSheet, View } from "react-native";
import { t } from "../../i18n/it";
import type { DeviceAuth } from "../../platform/deviceAuth";
import { useSettings } from "../../state/SettingsProvider";
import { AppText, Button, Screen } from "../../ui";

export const APP_LOCK_SETTINGS_KEY = "app_lock";

export type LockChangeResult = "saved" | "unavailable" | "cancelled";

interface AppLockContextValue {
  enabled: boolean;
  setEnabled: (on: boolean) => Promise<LockChangeResult>;
  /** Turns the lock off without asking (used after "delete all data"). */
  reset: () => Promise<void>;
}

const AppLockContext = createContext<AppLockContextValue | null>(null);

interface AppLockProviderProps {
  auth: DeviceAuth;
  children: ReactNode;
}

/**
 * Optional app lock (issue #13). When on, the app content is hidden — also from screen
 * readers — until the device owner authenticates, at launch and whenever the app returns
 * from the background. Switching it off also requires authentication.
 */
export function AppLockProvider({ auth, children }: AppLockProviderProps) {
  const settings = useSettings();
  const [enabled, setEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    settings
      .get(APP_LOCK_SETTINGS_KEY)
      .catch(() => null)
      .then(async (raw) => {
        if (!active) return;
        const on = raw === "on";
        setEnabledState(on);
        setLocked(on);
        setLoaded(true);
        if (on) await auth.setScreenProtection(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [settings, auth]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background" && enabled) setLocked(true);
    });
    return () => {
      subscription.remove();
    };
  }, [enabled]);

  const unlock = useCallback(async () => {
    if (await auth.authenticate(t("lock.prompt"))) setLocked(false);
  }, [auth]);

  const setEnabled = useCallback(
    async (on: boolean): Promise<LockChangeResult> => {
      if (on && !(await auth.isAvailable())) return "unavailable";
      if (!(await auth.authenticate(t("lock.prompt")))) return "cancelled";
      await settings.set(APP_LOCK_SETTINGS_KEY, on ? "on" : "off");
      await auth.setScreenProtection(on);
      setEnabledState(on);
      return "saved";
    },
    [auth, settings],
  );

  const reset = useCallback(async () => {
    setEnabledState(false);
    setLocked(false);
    await auth.setScreenProtection(false);
  }, [auth]);

  const value = useMemo(() => ({ enabled, setEnabled, reset }), [enabled, setEnabled, reset]);
  const hidden = !loaded || locked;

  return (
    <AppLockContext value={value}>
      <View
        style={styles.fill}
        accessibilityElementsHidden={hidden}
        importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
      >
        {children}
      </View>
      {hidden && <LockScreen ready={loaded} onUnlock={unlock} />}
    </AppLockContext>
  );
}

function LockScreen({ ready, onUnlock }: { ready: boolean; onUnlock: () => Promise<void> }) {
  useEffect(() => {
    if (ready) void onUnlock();
  }, [ready, onUnlock]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Screen centered>
        {ready && (
          <>
            <AppText variant="display" accessibilityRole="header">
              {t("lock.title")}
            </AppText>
            <Button label={t("lock.unlock")} onPress={onUnlock} />
          </>
        )}
      </Screen>
    </View>
  );
}

export function useAppLock(): AppLockContextValue {
  const context = useContext(AppLockContext);
  if (!context) throw new Error("useAppLock must be used inside <AppLockProvider>");
  return context;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
