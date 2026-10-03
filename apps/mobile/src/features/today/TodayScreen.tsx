import { currentPeriodView, type Instant, type Journey } from "@free/core";
import { StyleSheet, Text, View } from "react-native";
import { formatElapsed } from "./formatElapsed";

interface TodayScreenProps {
  journey: Journey;
  now: Instant;
}

/**
 * Scaffold of the dashboard (issue #1). Layout, theming and design-system components
 * arrive with #2; persistence and onboarding with #3/#4.
 */
export function TodayScreen({ journey, now }: TodayScreenProps) {
  const view = currentPeriodView(journey, now);
  if (!view) return null;
  const elapsed = formatElapsed(view.parts);

  return (
    <View style={styles.container}>
      <View accessible accessibilityLabel={elapsed.accessibilityLabel}>
        <Text style={styles.headline}>{elapsed.headline}</Text>
        <Text style={styles.detail}>{elapsed.detail}</Text>
      </View>
      {view.clockSkew && (
        <Text accessibilityRole="alert" style={styles.detail}>
          L'ora del dispositivo sembra cambiata. Il conteggio riprenderà automaticamente.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 16 },
  headline: { fontSize: 56, fontWeight: "600", fontVariant: ["tabular-nums"], textAlign: "center" },
  detail: { fontSize: 17, textAlign: "center" },
});
