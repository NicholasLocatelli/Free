import { useRouter } from "expo-router";
import { HelpScreen } from "../../src/features/help/HelpScreen";

export default function Help() {
  const router = useRouter();
  return (
    <HelpScreen
      onOpen={(section) => {
        router.push(`/help/${section}`);
      }}
      onBack={() => {
        router.back();
      }}
    />
  );
}
