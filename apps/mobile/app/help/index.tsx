import { useRouter } from "expo-router";
import { getHelpSections } from "../../src/features/help/content";
import { HelpScreen } from "../../src/features/help/HelpScreen";
import { useLocale } from "../../src/features/locale/LocaleProvider";

export default function Help() {
  const router = useRouter();
  const { country } = useLocale();
  return (
    <HelpScreen
      sections={getHelpSections(country)}
      hasCountry={country !== null}
      onOpen={(section) => {
        router.push(`/help/${section}`);
      }}
      onBack={() => {
        router.back();
      }}
    />
  );
}
