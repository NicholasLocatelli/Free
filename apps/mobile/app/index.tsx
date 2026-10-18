import { useRouter } from "expo-router";
import { HomeScreen } from "../src/features/home/HomeScreen";

export default function Index() {
  const router = useRouter();
  return (
    <HomeScreen
      actions={{
        onUrge: () => {
          router.push("/urge/sos");
        },
        onRelapse: () => {
          router.push("/relapse");
        },
        onHistory: () => {
          router.push("/history");
        },
        onSettings: () => {
          router.push("/settings");
        },
        onHelp: () => {
          router.push("/help");
        },
      }}
    />
  );
}
