import { useState } from "react";
import { Linking } from "react-native";
import { t, type MessageKey } from "../../i18n/it";
import { AppText, Button, TextField, Toggle } from "../../ui";
import { NEUTRAL_COPY, parseTimeOfDay, type ReminderPrefs } from "./reminderPlan";
import { useReminders } from "./RemindersProvider";

interface RemindersFormProps {
  /** Injected for tests. */
  openSettings?: () => Promise<unknown>;
}

const defaultOpenSettings = () => Linking.openSettings();

/** Shared by onboarding and settings. Every change is saved immediately. */
export function RemindersForm({ openSettings = defaultOpenSettings }: RemindersFormProps) {
  const { prefs, update } = useReminders();
  const [time, setTime] = useState(prefs.checkInTime);
  const [message, setMessage] = useState<MessageKey | null>(null);

  const apply = async (next: ReminderPrefs) => {
    const result = await update(next);
    setMessage(result === "permission_denied" ? "reminders.denied" : null);
  };

  return (
    <>
      <AppText color="muted">{t("reminders.body")}</AppText>
      <Toggle
        label={t("reminders.checkIn")}
        value={prefs.checkInEnabled}
        onValueChange={(checkInEnabled) => {
          void apply({ ...prefs, checkInEnabled });
        }}
      />
      {prefs.checkInEnabled && (
        <TextField
          label={t("reminders.checkInTime")}
          value={time}
          onChangeText={(text) => {
            setTime(text);
            if (parseTimeOfDay(text)) {
              setMessage(null);
              void apply({ ...prefs, checkInTime: text.trim() });
            } else {
              setMessage("reminders.invalid_time");
            }
          }}
          keyboardType="numbers-and-punctuation"
        />
      )}
      <Toggle
        label={t("reminders.milestones")}
        value={prefs.milestonesEnabled}
        onValueChange={(milestonesEnabled) => {
          void apply({ ...prefs, milestonesEnabled });
        }}
      />
      <AppText variant="caption" color="muted">
        {t("reminders.preview", { title: NEUTRAL_COPY.checkIn.title })}
      </AppText>
      {message !== null && (
        <AppText color="warning" accessibilityRole="alert">
          {t(message)}
        </AppText>
      )}
      {message === "reminders.denied" && (
        <Button
          label={t("reminders.openSystemSettings")}
          variant="secondary"
          onPress={() => openSettings().catch(() => undefined)}
        />
      )}
    </>
  );
}
