import { StyleSheet, View } from "react-native";
import { t } from "../../i18n/it";
import { AppText, Button, Card, ResourceCard, Screen, spacing } from "../../ui";
import type { HelpSection } from "./content";

const BULLET = "• ";

interface HelpSectionScreenProps {
  section: HelpSection;
  onBack: () => void;
  openUrl?: (url: string) => Promise<unknown>;
}

export function HelpSectionScreen({ section, onBack, openUrl }: HelpSectionScreenProps) {
  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {section.title}
      </AppText>
      <View style={styles.body}>
        {section.body.map((paragraph) =>
          paragraph.startsWith(BULLET) ? (
            <View key={paragraph} style={styles.bullet}>
              <AppText accessibilityElementsHidden importantForAccessibility="no">
                •
              </AppText>
              <AppText style={styles.bulletText}>{paragraph.slice(BULLET.length)}</AppText>
            </View>
          ) : (
            <AppText key={paragraph}>{paragraph}</AppText>
          ),
        )}
      </View>
      {section.faq?.map((item) => (
        <Card key={item.question}>
          <AppText variant="bodyStrong" accessibilityRole="header">
            {item.question}
          </AppText>
          <AppText>{item.answer}</AppText>
        </Card>
      ))}
      {section.resources.map((resource) => (
        <ResourceCard key={resource.name} resource={resource} {...(openUrl ? { openUrl } : {})} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md },
  bullet: { flexDirection: "row", gap: spacing.sm },
  bulletText: { flex: 1 },
});
