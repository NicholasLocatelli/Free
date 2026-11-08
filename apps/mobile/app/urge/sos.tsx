import { useRouter } from "expo-router";
import { useSosHelpline } from "../../src/features/help/helpline";
import { SosScreen } from "../../src/features/sos/SosScreen";

export default function Sos() {
  const router = useRouter();
  const helpline = useSosHelpline();
  return (
    <SosScreen
      helpline={helpline}
      onRecord={() => {
        router.replace("/urge/new");
      }}
      onHelp={() => {
        router.push("/help");
      }}
      onClose={() => {
        router.back();
      }}
    />
  );
}
