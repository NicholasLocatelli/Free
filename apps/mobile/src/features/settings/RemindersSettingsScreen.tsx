import { t } from "../../i18n/it";
import { AppText, Button, Screen } from "../../ui";
import { RemindersForm } from "../reminders/RemindersForm";

export function RemindersSettingsScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("reminders.title")}
      </AppText>
      <RemindersForm />
    </Screen>
  );
}
