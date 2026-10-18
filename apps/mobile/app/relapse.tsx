import { useRouter } from "expo-router";
import { RelapseScreen } from "../src/features/relapse/RelapseScreen";

export default function Relapse() {
  const router = useRouter();
  return (
    <RelapseScreen
      onDone={() => {
        router.dismissTo("/");
      }}
      onHelp={() => {
        router.push("/help/after-relapse");
      }}
      onCancel={() => {
        router.back();
      }}
    />
  );
}
