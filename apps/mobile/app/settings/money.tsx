import { useRouter } from "expo-router";
import { MoneySettingsScreen } from "../../src/features/settings/MoneySettingsScreen";

export default function MoneySettings() {
  const router = useRouter();
  return (
    <MoneySettingsScreen
      onBack={() => {
        router.back();
      }}
    />
  );
}
