import { useRouter } from "expo-router";
import { SosScreen } from "../../src/features/sos/SosScreen";

export default function Sos() {
  const router = useRouter();
  return (
    <SosScreen
      onRecord={() => {
        router.replace("/urge/new");
      }}
      onClose={() => {
        router.back();
      }}
    />
  );
}
