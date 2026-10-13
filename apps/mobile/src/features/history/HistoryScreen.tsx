import {
  achievedMilestones,
  estimateMoneyNotSpent,
  journeyStats,
  periodDurationMs,
  type Instant,
  type Journey,
  type Period,
} from "@free/core";
import { StyleSheet, View } from "react-native";
import { formatDay, formatDuration, formatGoal, formatMoney } from "../../i18n/format";
import { t } from "../../i18n/it";
import { tagLabel } from "../../i18n/tags";
import { AppText, Button, Card, Screen, spacing, Stat } from "../../ui";

interface HistoryScreenProps {
  journey: Journey;
  now: Instant;
  onBack: () => void;
}

/** Flow 5: every period stays visible, with what it reached. Newest first. */
export function HistoryScreen({ journey, now, onBack }: HistoryScreenProps) {
  const stats = journeyStats(journey, now);
  const periods = [...journey.periods].reverse();

  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("nav.history")}
      </AppText>

      <AppText variant="heading" accessibilityRole="header">
        {t("history.summary")}
      </AppText>
      <View style={styles.stats}>
        <Stat label={t("today.totalTime")} value={formatDuration(stats.totalTimeMs)} />
        <Stat label={t("history.longest")} value={formatDuration(stats.longestPeriodMs)} />
        <Stat label={t("today.urgesResisted")} value={String(stats.urgesResistedCount)} />
        {stats.totalMoney.status === "estimated" && (
          <Stat
            label={t("money.label")}
            value={`~ ${formatMoney(stats.totalMoney.amountMinor, stats.totalMoney.currency)}`}
            caption={t("money.caption")}
          />
        )}
      </View>

      {periods.map((period) => (
        <PeriodCard key={period.id} journey={journey} period={period} now={now} />
      ))}
    </Screen>
  );
}

function PeriodCard({ journey, period, now }: { journey: Journey; period: Period; now: Instant }) {
  const end = period.endedAt ?? now;
  const duration = periodDurationMs(period, now);
  const milestones = achievedMilestones([period], journey.milestoneHours, now);
  const urges = journey.urges.filter(
    (u) => u.occurredAt >= period.startedAt && u.occurredAt <= end,
  );
  const relapse = journey.relapses.find((r) => r.periodId === period.id);
  const money = estimateMoneyNotSpent(journey.money, duration);
  const range =
    period.endedAt === null
      ? t("history.periodOpen", { start: formatDay(period.startedAt) })
      : t("history.period", { start: formatDay(period.startedAt), end: formatDay(period.endedAt) });

  return (
    <Card>
      <AppText variant="heading">{formatDuration(duration)}</AppText>
      <AppText color="muted">
        {period.endedAt === null ? `${range} · ${t("history.current")}` : range}
      </AppText>
      {milestones.length > 0 && (
        <AppText>
          {t("history.milestones", { list: milestones.map((m) => formatGoal(m.hours)).join(", ") })}
        </AppText>
      )}
      <AppText>{t("history.urges", { n: urges.length })}</AppText>
      {money.status === "estimated" && (
        <AppText>
          {`${t("money.label")}: ~ ${formatMoney(money.amountMinor, money.currency)}`}
        </AppText>
      )}
      {relapse && relapse.contributingFactors.length > 0 && (
        <AppText>
          {t("history.factors", { list: relapse.contributingFactors.map(tagLabel).join(", ") })}
        </AppText>
      )}
      {relapse?.note != null && <AppText color="muted">{`“${relapse.note}”`}</AppText>}
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { gap: spacing.md },
});
