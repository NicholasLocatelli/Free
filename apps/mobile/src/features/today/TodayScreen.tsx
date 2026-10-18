import { currentPeriodView, journeyStats, type Instant, type Journey } from "@free/core";
import { StyleSheet, View } from "react-native";
import { formatDayTime, formatDuration, formatGoal, formatMoney } from "../../i18n/format";
import { t } from "../../i18n/it";
import { AppText, Button, ProgressRing, Screen, spacing, Stat, Timer } from "../../ui";

export interface TodayActions {
  onUrge: () => void;
  onRelapse: () => void;
  onHistory: () => void;
  onSettings: () => void;
  onHelp: () => void;
}

interface TodayScreenProps extends TodayActions {
  journey: Journey;
  now: Instant;
}

const PERCENT = 100;

/** Dashboard (Flow 2): progress at a glance, urge/relapse actions, help one tap away. */
export function TodayScreen({
  journey,
  now,
  onUrge,
  onRelapse,
  onHistory,
  onSettings,
  onHelp,
}: TodayScreenProps) {
  const view = currentPeriodView(journey, now);
  if (!view) return null;
  const stats = journeyStats(journey, now);
  const { next, progressToNext } = view.milestones;

  return (
    <Screen centered>
      <View style={styles.container}>
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
        {stats.periodsCount > 1 && (
          <Stat
            label={t("today.journey")}
            value={formatDuration(stats.totalTimeMs)}
            caption={t("today.totalTime")}
          />
        )}
        {stats.urgesResistedCount > 0 && (
          <Stat label={t("today.urgesResisted")} value={String(stats.urgesResistedCount)} />
        )}
      </View>
      <View style={styles.actions}>
        <Button label={t("today.urgeButton")} onPress={onUrge} />
        <Button label={t("today.relapseButton")} variant="secondary" onPress={onRelapse} />
        <View style={styles.links}>
          <Button label={t("nav.help")} variant="tertiary" onPress={onHelp} />
          <Button label={t("nav.history")} variant="tertiary" onPress={onHistory} />
          <Button label={t("nav.settings")} variant="tertiary" onPress={onSettings} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, alignItems: "center" },
  actions: { gap: spacing.sm },
  links: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  center: { textAlign: "center" },
});
