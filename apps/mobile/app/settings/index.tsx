import { useRouter } from "expo-router";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";

export default function Settings() {
  const router = useRouter();
  return (
    <SettingsScreen
      onOpen={(section) => {
        router.push(`/settings/${section}`);
      }}
      onBack={() => {
        router.back();
      }}
    />
  );
}
