import { authenticateAsync, getEnrolledLevelAsync, SecurityLevel } from "expo-local-authentication";
import {
  allowScreenCaptureAsync,
  disableAppSwitcherProtectionAsync,
  enableAppSwitcherProtectionAsync,
  preventScreenCaptureAsync,
} from "expo-screen-capture";
import { Platform } from "react-native";

/** Device-level protection used by the app lock. Never stores a secret in the app. */
export interface DeviceAuth {
  /** True when the phone has a screen lock (PIN, pattern, password or biometrics). */
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<boolean>;
  /** Hides the app preview in the recent-apps switcher (and blocks screenshots on Android). */
  setScreenProtection(on: boolean): Promise<void>;
}

const PROTECTION_KEY = "app-lock";

export function createDeviceAuth(): DeviceAuth {
  return {
    async isAvailable() {
      try {
        return (await getEnrolledLevelAsync()) !== SecurityLevel.NONE;
      } catch {
        return false;
      }
    },
    async authenticate(reason) {
      try {
        const result = await authenticateAsync({
          promptMessage: reason,
          cancelLabel: "Annulla",
          disableDeviceFallback: false,
        });
        return result.success;
      } catch {
        return false;
      }
    },
    async setScreenProtection(on) {
      try {
        if (on) {
          await preventScreenCaptureAsync(PROTECTION_KEY);
          if (Platform.OS === "ios") await enableAppSwitcherProtectionAsync();
        } else {
          await allowScreenCaptureAsync(PROTECTION_KEY);
          if (Platform.OS === "ios") await disableAppSwitcherProtectionAsync();
        }
      } catch {
        // Not available (e.g. some simulators): the lock itself still works.
      }
    },
  };
}
