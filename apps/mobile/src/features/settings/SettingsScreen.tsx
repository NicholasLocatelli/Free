import { LANGUAGE_NAMES, LANGUAGES, t } from "../../i18n";
import { COUNTRY_CODES } from "../help/countries";
import { useLocale, type CountryPreference } from "../locale/LocaleProvider";
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

export type SettingsSection = "money" | "goals" | "start" | "reminders" | "privacy";
export const THEME_SETTINGS_KEY = "theme";
const PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];

interface SettingsScreenProps {
  onOpen: (section: SettingsSection) => void;
  onBack: () => void;
}

export function SettingsScreen({ onOpen, onBack }: SettingsScreenProps) {
  const { preference, setPreference } = useThemeContext();
  const settings = useSettings();
  const locale = useLocale();
  const countryOptions: readonly CountryPreference[] = ["auto", ...COUNTRY_CODES, "none"];
  const countryLabel = (option: CountryPreference) =>
    option === "auto"
      ? t("settings.countryAuto")
      : option === "none"
        ? t("settings.countryOther")
        : t(`country.${option}`);

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
      {section("reminders", t("settings.reminders"))}
      {section("privacy", t("settings.privacy"))}
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
      <ChoiceGroup label={t("settings.language")}>
        {(["system", ...LANGUAGES] as const).map((option) => (
          <Chip
            key={option}
            selection="single"
            label={option === "system" ? t("settings.languageSystem") : LANGUAGE_NAMES[option]}
            selected={locale.languagePreference === option}
            onPress={() => {
              locale.setLanguagePreference(option);
            }}
          />
        ))}
      </ChoiceGroup>
      <ChoiceGroup label={t("settings.country")}>
        {countryOptions.map((option) => (
          <Chip
            key={option}
            selection="single"
            label={countryLabel(option)}
            selected={locale.countryPreference === option}
            onPress={() => {
              locale.setCountryPreference(option);
            }}
          />
        ))}
      </ChoiceGroup>
    </Screen>
  );
}
