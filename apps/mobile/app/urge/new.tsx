import { useRouter } from "expo-router";
import { UrgeScreen } from "../../src/features/urge/UrgeScreen";

export default function NewUrge() {
  const router = useRouter();
  return (
    <UrgeScreen
      onDone={() => {
        router.dismissTo("/");
      }}
      onCancel={() => {
        router.back();
      }}
      onRelapse={() => {
        router.replace("/relapse");
      }}
    />
  );
}
