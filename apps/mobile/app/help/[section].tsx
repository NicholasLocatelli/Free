import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { getHelpSection } from "../../src/features/help/content";
import { HelpSectionScreen } from "../../src/features/help/HelpSectionScreen";
import { useLocale } from "../../src/features/locale/LocaleProvider";

export default function HelpSectionRoute() {
  const router = useRouter();
  const { country } = useLocale();
  const { section: id } = useLocalSearchParams<{ section: string }>();
  const section = getHelpSection(id, country);
  if (!section) return <Redirect href="/help" />;
  return (
    <HelpSectionScreen
      section={section}
      onBack={() => {
        router.back();
      }}
    />
  );
}
