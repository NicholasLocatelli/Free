import { currentPeriodView, type Instant, type Journey } from "@free/core";
import { ScrollView, StyleSheet } from "react-native";
import { formatDayTime, formatGoal, formatMoney } from "../../i18n/format";
import { t } from "../../i18n/it";
import { AppText, ProgressRing, spacing, Stat, Timer } from "../../ui";

interface TodayScreenProps {
  journey: Journey;
  now: Instant;
}

const PERCENT = 100;

/**
 * Dashboard read view. Actions (urge, relapse, help) are added with their flows in M4/M5
 * so that no button exists without a working destination.
 */
export function TodayScreen({ journey, now }: TodayScreenProps) {
  const view = currentPeriodView(journey, now);
  if (!view) return null;
  const { next, progressToNext } = view.milestones;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText variant="display" accessibilityRole="header">
        {t("today.title")}
      </AppText>
      {view.clockSkew && (
        <AppText color="warning" accessibilityRole="alert">
          {t("today.clockSkew")}
        </AppText>
      )}
      <ProgressRing
        value={progressToNext}
        accessibilityLabel={
          next === null
            ? t("today.allGoalsReached")
            : t("today.nextGoal", { goal: formatGoal(next) })
        }
      >
        <AppText variant="heading" color="primary">
          {`${Math.round(progressToNext * PERCENT)}%`}
        </AppText>
      </ProgressRing>
      <Timer parts={view.parts} />
      <AppText color="muted" style={styles.center}>
        {t("today.since", { date: formatDayTime(view.startedAt) })}
      </AppText>
      <AppText style={styles.center}>
        {next === null
          ? t("today.allGoalsReached")
          : t("today.nextGoal", { goal: formatGoal(next) })}
      </AppText>
      {view.money.status === "estimated" && (
        <Stat
          label={t("money.label")}
          value={`~ ${formatMoney(view.money.amountMinor, view.money.currency)}`}
          caption={t("money.caption")}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg, alignItems: "center" },
  center: { textAlign: "center" },
});
