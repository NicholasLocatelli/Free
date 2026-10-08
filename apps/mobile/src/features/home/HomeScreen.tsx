import { ActivityIndicator, StyleSheet, View } from "react-native";
import { t } from "../../i18n/it";
import { useNow } from "../../platform/useNow";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { Button, ErrorState, spacing, useTheme } from "../../ui";
import { OnboardingFlow } from "../onboarding/OnboardingFlow";
import { TodayScreen } from "../today/TodayScreen";

/**
 * Entry route: loading → error (with retry) → onboarding → dashboard.
 */
export function HomeScreen() {
  const boot = useJourneyStore((s) => s.boot);
  const journey = useJourneyStore((s) => s.journey);
  const load = useJourneyStore((s) => s.load);
  const now = useNow();
  const { colors } = useTheme();

  if (boot.status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} accessibilityLabel="Caricamento" />
      </View>
    );
  }

  if (boot.status === "error") {
    return (
      <View style={styles.center}>
        <ErrorState
          title={t("error.data.title")}
          body={t("error.data.body")}
          actions={<Button label={t("common.retry")} onPress={load} />}
        />
      </View>
    );
  }

  if (!journey) {
    return <OnboardingFlow />;
  }

  return <TodayScreen journey={journey} now={now} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.md },
});
