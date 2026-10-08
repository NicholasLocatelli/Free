import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { createAppStore } from "../src/state/createAppStore";
import { JourneyStoreProvider } from "../src/state/JourneyStoreProvider";
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
  const [store] = useState(createAppStore);
  useEffect(() => {
    void store.getState().load();
  }, [store]);

  return (
    <JourneyStoreProvider store={store}>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </JourneyStoreProvider>
  );
}
