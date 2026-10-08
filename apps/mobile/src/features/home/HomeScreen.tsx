import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { t } from "../../i18n/it";
import { useNow } from "../../platform/useNow";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { AppText, Button, EmptyState, ErrorState, spacing, useTheme } from "../../ui";
import { TodayScreen } from "../today/TodayScreen";

/**
 * Entry route: loading → error (with retry) → first start → dashboard.
 * The first-start step becomes the full onboarding in #4.
 */
export function HomeScreen() {
  const boot = useJourneyStore((s) => s.boot);
  const journey = useJourneyStore((s) => s.journey);
  const load = useJourneyStore((s) => s.load);
  const start = useJourneyStore((s) => s.start);
  const now = useNow();
  const { colors } = useTheme();
  const [saveFailed, setSaveFailed] = useState(false);

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
    return (
      <View style={styles.center}>
        <EmptyState
          title={t("start.title")}
          body={t("start.body")}
          actions={
            <Button
              label={t("start.now")}
              onPress={async () => {
                const result = await start({ categoryId: "gambling", startedAt: Date.now() });
                setSaveFailed(!result.ok);
              }}
            />
          }
        />
        {saveFailed && (
          <AppText color="warning" accessibilityRole="alert">
            {t("error.save")}
          </AppText>
        )}
      </View>
    );
  }

  return <TodayScreen journey={journey} now={now} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.md },
});
