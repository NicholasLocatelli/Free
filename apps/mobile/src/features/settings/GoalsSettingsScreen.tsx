import { DEFAULT_MILESTONE_HOURS, MAX_MILESTONE_HOURS, MS_PER_DAY, MS_PER_HOUR } from "@free/core";
import { useState } from "react";
import { formatGoal } from "../../i18n/format";
import { t, type MessageKey } from "../../i18n/it";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { AppText, Button, Card, Screen, TextField } from "../../ui";

const HOURS_PER_DAY = MS_PER_DAY / MS_PER_HOUR;
const MAX_DAYS = Math.floor(MAX_MILESTONE_HOURS / HOURS_PER_DAY);
const DAYS_MAX_LENGTH = 5;

/** Add, remove or reset milestones. Milestones already reached stay in history (derived). */
export function GoalsSettingsScreen({ onBack }: { onBack: () => void }) {
  const journey = useJourneyStore((s) => s.journey);
  const updateMilestones = useJourneyStore((s) => s.updateMilestones);
  const [days, setDays] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);

  if (!journey) return null;
  const hours = journey.milestoneHours;

  const apply = async (next: readonly number[]) => {
    const result = await updateMilestones(next);
    setError(result.ok ? null : next.length === 0 ? "goals.lastOne" : "error.save");
    return result.ok;
  };

  const add = async () => {
    const value = Number(days.trim());
    if (!Number.isInteger(value) || value < 1 || value > MAX_DAYS) {
      setError("goals.invalid");
      return;
    }
    if (await apply([...hours, value * HOURS_PER_DAY])) setDays("");
  };

  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("settings.goals")}
      </AppText>
      {hours.map((h) => (
        <Card key={h}>
          <AppText variant="bodyStrong">{formatGoal(h)}</AppText>
          <Button
            label={t("goals.remove", { goal: formatGoal(h) })}
            variant="tertiary"
            disabled={hours.length === 1}
            onPress={() => apply(hours.filter((x) => x !== h))}
          />
        </Card>
      ))}
      <TextField
        label={t("goals.add")}
        value={days}
        onChangeText={(text) => {
          setError(null);
          setDays(text);
        }}
        keyboardType="number-pad"
        maxLength={DAYS_MAX_LENGTH}
      />
      {error !== null && (
        <AppText color="warning" accessibilityRole="alert">
          {t(error)}
        </AppText>
      )}
      <Button label={t("goals.addButton")} onPress={add} />
      <Button
        label={t("goals.reset")}
        variant="secondary"
        onPress={() => apply(DEFAULT_MILESTONE_HOURS)}
      />
    </Screen>
  );
}
