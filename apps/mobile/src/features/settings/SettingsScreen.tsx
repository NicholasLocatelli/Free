import { t } from "../../i18n/it";
import { useSettings } from "../../state/SettingsProvider";
import {
  AppText,
  Button,
  Card,
  Chip,
  ChoiceGroup,
  Screen,
  useThemeContext,
  type ThemePreference,
} from "../../ui";

export type SettingsSection = "money" | "goals" | "start";
export const THEME_SETTINGS_KEY = "theme";
const PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];

interface SettingsScreenProps {
  onOpen: (section: SettingsSection) => void;
  onBack: () => void;
}

export function SettingsScreen({ onOpen, onBack }: SettingsScreenProps) {
  const { preference, setPreference } = useThemeContext();
  const settings = useSettings();

  const section = (key: SettingsSection, label: string) => (
    <Card
      accessibilityLabel={label}
      onPress={() => {
        onOpen(key);
      }}
    >
      <AppText variant="bodyStrong">{label}</AppText>
    </Card>
  );

  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("settings.title")}
      </AppText>
      {section("money", t("settings.money"))}
      {section("goals", t("settings.goals"))}
      {section("start", t("settings.start"))}
      <ChoiceGroup label={t("settings.theme")}>
        {PREFERENCES.map((p) => (
          <Chip
            key={p}
            selection="single"
            label={t(`theme.${p}`)}
            selected={preference === p}
            onPress={() => {
              setPreference(p);
              settings.set(THEME_SETTINGS_KEY, p).catch(() => undefined);
            }}
          />
        ))}
      </ChoiceGroup>
    </Screen>
  );
}
