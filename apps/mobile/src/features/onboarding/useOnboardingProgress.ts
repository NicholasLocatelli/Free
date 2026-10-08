import { useCallback, useEffect, useState } from "react";
import { useSettings } from "../../state/SettingsProvider";
import {
  deserializeProgress,
  ONBOARDING_SETTINGS_KEY,
  serializeProgress,
  type OnboardingProgress,
} from "./onboardingModel";

/**
 * Onboarding progress persisted on every change, so closing the app mid-flow resumes
 * from the same step (ONB-5). Returns null while the saved progress is being read.
 */
export function useOnboardingProgress() {
  const settings = useSettings();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);

  useEffect(() => {
    let active = true;
    settings
      .get(ONBOARDING_SETTINGS_KEY)
      .catch(() => null)
      .then((raw) => {
        if (active) setProgress(deserializeProgress(raw));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [settings]);

  const update = useCallback(
    (next: OnboardingProgress) => {
      setProgress(next);
      // Best effort: losing a draft only means repeating a few taps.
      settings.set(ONBOARDING_SETTINGS_KEY, serializeProgress(next)).catch(() => undefined);
    },
    [settings],
  );

  const clear = useCallback(
    () => settings.remove(ONBOARDING_SETTINGS_KEY).catch(() => undefined),
    [settings],
  );

  return { progress, update, clear };
}
