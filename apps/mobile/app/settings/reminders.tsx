import { useRouter } from "expo-router";
import { RemindersSettingsScreen } from "../../src/features/settings/RemindersSettingsScreen";

export default function RemindersSettings() {
  const router = useRouter();
  return (
    <RemindersSettingsScreen
      onBack={() => {
        router.back();
      }}
    />
  );
}
