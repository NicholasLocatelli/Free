import { useRouter } from "expo-router";
import { GoalsSettingsScreen } from "../../src/features/settings/GoalsSettingsScreen";

export default function GoalsSettings() {
  const router = useRouter();
  return (
    <GoalsSettingsScreen
      onBack={() => {
        router.back();
      }}
    />
  );
}
