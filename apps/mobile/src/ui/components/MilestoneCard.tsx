import type { Instant } from "@free/core";
import { StyleSheet, View } from "react-native";
import { formatDay, formatGoal } from "../../i18n/format";
import { t } from "../../i18n/it";
import { useTheme } from "../theme/ThemeProvider";
import { radius, spacing } from "../theme/tokens";
import { AppText } from "./AppText";
import { Card } from "./Card";

export type MilestoneStatus = "reached" | "next" | "future";

export interface MilestoneCardProps {
  hours: number;
  status: MilestoneStatus;
  /** Required for reached milestones. */
  achievedAt?: Instant;
}

const DOT_SIZE = 12;

function statusText(status: MilestoneStatus, achievedAt: Instant | undefined): string {
  if (status === "reached" && achievedAt !== undefined) {
    return t("milestone.reachedOn", { date: formatDay(achievedAt) });
  }
  return status === "next" ? t("milestone.next") : t("milestone.future");
}

/** Status is always written in text; the dot is decorative. */
export function MilestoneCard({ hours, status, achievedAt }: MilestoneCardProps) {
  const { colors } = useTheme();
  const goal = formatGoal(hours);
  const detail = statusText(status, achievedAt);
  const dotColor =
    status === "reached" ? colors.success : status === "next" ? colors.primary : colors.outline;

  return (
    <Card>
      <View accessible accessibilityLabel={`${goal}, ${detail}`} style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <View style={styles.text}>
          <AppText variant="bodyStrong">{goal}</AppText>
          <AppText variant="caption" color="muted">
            {detail}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: radius.full },
  text: { flex: 1 },
});
