import { useRouter } from "expo-router";
import { StartSettingsScreen } from "../../src/features/settings/StartSettingsScreen";

export default function StartSettings() {
  const router = useRouter();
  return (
    <StartSettingsScreen
      onBack={() => {
        router.back();
      }}
    />
  );
}
