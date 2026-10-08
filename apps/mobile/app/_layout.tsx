import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { createAppServices } from "../src/state/createAppStore";
import { JourneyStoreProvider } from "../src/state/JourneyStoreProvider";
import { SettingsProvider } from "../src/state/SettingsProvider";
import { ThemeProvider, useTheme } from "../src/ui";

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
          <ThemedStack />
        </ThemeProvider>
      </SettingsProvider>
    </JourneyStoreProvider>
  );
}
