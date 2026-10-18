import { t } from "../../i18n/it";
import { AppText, Button, Card, Screen } from "../../ui";
import { HELP_SECTIONS, type HelpSectionId } from "./content";

interface HelpScreenProps {
  onOpen: (section: HelpSectionId) => void;
  onBack: () => void;
}

/** Help Center index (M5). Works offline: all content is bundled with the app. */
export function HelpScreen({ onOpen, onBack }: HelpScreenProps) {
  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("help.title")}
      </AppText>
      {HELP_SECTIONS.map((section) => (
        <Card
          key={section.id}
          accessibilityLabel={`${section.title}. ${section.summary}`}
          onPress={() => {
            onOpen(section.id);
          }}
        >
          <AppText variant="bodyStrong">{section.title}</AppText>
          <AppText color="muted">{section.summary}</AppText>
        </Card>
      ))}
    </Screen>
  );
}
