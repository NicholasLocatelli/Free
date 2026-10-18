import { useState } from "react";
import { formatDay } from "../../i18n/format";
import { t, type MessageKey } from "../../i18n/it";
import type { BackupFiles } from "../../platform/backupFiles";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { useSettings } from "../../state/SettingsProvider";
import {
  AppText,
  Button,
  Card,
  Screen,
  TextField,
  Toggle,
  useThemeContext,
  type ThemePreference,
} from "../../ui";
import {
  backupFileName,
  parseBackup,
  PORTABLE_SETTINGS,
  serializeBackup,
  type BackupContent,
} from "../backup/backupFormat";
import { useAppLock } from "../lock/AppLockProvider";
import { useReminders } from "../reminders/RemindersProvider";
import { THEME_SETTINGS_KEY } from "./SettingsScreen";

interface PrivacySettingsScreenProps {
  files: BackupFiles;
  onBack: () => void;
  /** Called after all data was deleted: the app goes back to onboarding. */
  onDeleted: () => void;
  now?: () => number;
}

type Feedback = { key: MessageKey; vars?: Record<string, string | number>; error: boolean };

const isTheme = (v: string | undefined): v is ThemePreference =>
  v === "system" || v === "light" || v === "dark";

/** App lock, export/import and delete-all (issue #13). */
export function PrivacySettingsScreen({
  files,
  onBack,
  onDeleted,
  now = Date.now,
}: PrivacySettingsScreenProps) {
  const journey = useJourneyStore((s) => s.journey);
  const importJourney = useJourneyStore((s) => s.importJourney);
  const deleteAll = useJourneyStore((s) => s.deleteAll);
  const settings = useSettings();
  const lock = useAppLock();
  const reminders = useReminders();
  const { setPreference } = useThemeContext();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, setPending] = useState<BackupContent | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const toggleLock = async (on: boolean) => {
    const result = await lock.setEnabled(on);
    setFeedback(
      result === "saved"
        ? null
        : { key: result === "unavailable" ? "lock.unavailable" : "lock.cancelled", error: true },
    );
  };

  const exportData = async () => {
    if (!journey) return;
    const portable: Record<string, string> = {};
    for (const key of PORTABLE_SETTINGS) {
      const value = await settings.get(key).catch(() => null);
      if (value !== null) portable[key] = value;
    }
    const at = now();
    const result = await files
      .share(backupFileName(at), serializeBackup({ journey, settings: portable }, at))
      .catch(() => "unavailable" as const);
    setFeedback(
      result === "shared"
        ? { key: "backup.exported", error: false }
        : { key: "backup.unavailable", error: true },
    );
  };

  const pickImport = async () => {
    setPending(null);
    const text = await files.pick().catch(() => null);
    if (text === null) return;
    const parsed = parseBackup(text);
    if (!parsed.ok) {
      setFeedback({ key: `backup.error.${parsed.error}`, error: true });
      return;
    }
    setFeedback(null);
    setPending(parsed.value);
  };

  const confirmImport = async () => {
    if (!pending) return;
    const result = await importJourney(pending.journey);
    if (!result.ok) {
      setFeedback({ key: "error.save", error: true });
      return;
    }
    for (const [key, value] of Object.entries(pending.settings)) {
      await settings.set(key, value).catch(() => undefined);
    }
    const theme = pending.settings[THEME_SETTINGS_KEY];
    if (isTheme(theme)) setPreference(theme);
    await reminders.reload();
    setPending(null);
    setFeedback({ key: "backup.imported", error: false });
  };

  const deleteEverything = async () => {
    const result = await deleteAll();
    if (!result.ok) {
      setFeedback({ key: "error.save", error: true });
      return;
    }
    await reminders.reset();
    await lock.reset();
    setPreference("system");
    onDeleted();
  };

  const first = pending?.journey.periods[0];

  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("settings.privacy")}
      </AppText>

      <Toggle
        label={t("lock.toggle")}
        description={t("lock.description")}
        value={lock.enabled}
        onValueChange={(on) => {
          void toggleLock(on);
        }}
      />

      <Card>
        <AppText variant="heading" accessibilityRole="header">
          {t("backup.title")}
        </AppText>
        <AppText>{t("backup.body")}</AppText>
        <AppText color="warning">{t("backup.warning")}</AppText>
        <Button label={t("backup.export")} variant="secondary" onPress={exportData} />
        <Button label={t("backup.import")} variant="secondary" onPress={pickImport} />
        {pending && first && (
          <>
            <AppText accessibilityLiveRegion="polite">
              {t("backup.importConfirm", {
                periods: pending.journey.periods.length,
                urges: pending.journey.urges.length,
                start: formatDay(first.startedAt),
              })}
            </AppText>
            <Button label={t("backup.importReplace")} onPress={confirmImport} />
            <Button
              label={t("common.cancel")}
              variant="tertiary"
              onPress={() => {
                setPending(null);
              }}
            />
          </>
        )}
      </Card>

      {feedback && (
        <AppText
          color={feedback.error ? "warning" : "success"}
          accessibilityRole={feedback.error ? "alert" : "text"}
          accessibilityLiveRegion="polite"
        >
          {t(feedback.key, feedback.vars)}
        </AppText>
      )}

      <Card>
        <AppText variant="heading" accessibilityRole="header">
          {t("delete.title")}
        </AppText>
        <AppText>{t("delete.body")}</AppText>
        <TextField
          label={t("delete.confirmLabel")}
          value={confirmText}
          onChangeText={setConfirmText}
        />
        <Button
          label={t("delete.button")}
          variant="destructive"
          disabled={confirmText.trim() !== t("delete.confirmWord")}
          onPress={deleteEverything}
        />
      </Card>
    </Screen>
  );
}
