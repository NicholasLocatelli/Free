import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { LocaleProvider, useLocale } from "../src/features/locale/LocaleProvider";
import { AppLockProvider } from "../src/features/lock/AppLockProvider";
import { RemindersProvider } from "../src/features/reminders/RemindersProvider";
import { createDeviceAuth } from "../src/platform/deviceAuth";
import { readDeviceLocale } from "../src/platform/deviceLocale";
import { createExpoReminderScheduler } from "../src/platform/notifications";
import { createAppServices } from "../src/state/createAppStore";
import { JourneyStoreProvider } from "../src/state/JourneyStoreProvider";
import { THEME_SETTINGS_KEY } from "../src/features/settings/SettingsScreen";
import { SettingsProvider, useSettings } from "../src/state/SettingsProvider";
import { ThemeProvider, useTheme, useThemeContext } from "../src/ui";

/** Applies the theme saved in settings (see SettingsScreen) once at startup. */
function SavedThemePreference() {
  const settings = useSettings();
  const { setPreference } = useThemeContext();
  useEffect(() => {
    settings
      .get(THEME_SETTINGS_KEY)
      .then((saved) => {
        if (saved === "system" || saved === "light" || saved === "dark") setPreference(saved);
      })
      .catch(() => undefined);
  }, [settings, setPreference]);
  return null;
}

function ThemedStack() {
  const { colors, scheme } = useTheme();
  // A language change remounts the screens so every text is rendered again in it.
  const { language } = useLocale();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        key={language}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [services] = useState(createAppServices);
  const [scheduler] = useState(createExpoReminderScheduler);
  const [deviceAuth] = useState(createDeviceAuth);
  useEffect(() => {
    void services.journeyStore.getState().load();
  }, [services]);

  return (
    <JourneyStoreProvider store={services.journeyStore}>
      <SettingsProvider settings={services.settings}>
        <LocaleProvider device={readDeviceLocale}>
          <RemindersProvider scheduler={scheduler}>
            <ThemeProvider>
              <SavedThemePreference />
              <AppLockProvider auth={deviceAuth}>
                <ThemedStack />
              </AppLockProvider>
            </ThemeProvider>
          </RemindersProvider>
        </LocaleProvider>
      </SettingsProvider>
    </JourneyStoreProvider>
  );
}
