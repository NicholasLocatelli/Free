import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
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
  useEffect(() => {
    void services.journeyStore.getState().load();
  }, [services]);

  return (
    <JourneyStoreProvider store={services.journeyStore}>
      <SettingsProvider settings={services.settings}>
        <ThemeProvider>
          <SavedThemePreference />
          <ThemedStack />
        </ThemeProvider>
      </SettingsProvider>
    </JourneyStoreProvider>
  );
}
