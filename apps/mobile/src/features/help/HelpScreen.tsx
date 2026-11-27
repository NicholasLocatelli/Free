import { t } from "../../i18n";
import { AppText, Button, Card, Screen } from "../../ui";
import type { HelpSection, HelpSectionId } from "./content";

interface HelpScreenProps {
  sections: readonly HelpSection[];
  /** False when the app has no verified resources for the user's country. */
  hasCountry: boolean;
  onOpen: (section: HelpSectionId) => void;
  onBack: () => void;
}

/** Help Center index (M5). Works offline: all content is bundled with the app. */
export function HelpScreen({ sections, hasCountry, onOpen, onBack }: HelpScreenProps) {
  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("help.title")}
      </AppText>
      {!hasCountry && (
        <Card>
          <AppText variant="bodyStrong" accessibilityRole="header">
            {t("help.noCountry.title")}
          </AppText>
          <AppText>{t("help.noCountry.body")}</AppText>
        </Card>
      )}
      {sections.map((section) => (
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
