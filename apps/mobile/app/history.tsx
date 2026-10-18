import { useRouter } from "expo-router";
import { HistoryScreen } from "../src/features/history/HistoryScreen";
import { useNow } from "../src/platform/useNow";
import { useJourneyStore } from "../src/state/JourneyStoreProvider";

export default function History() {
  const router = useRouter();
  const journey = useJourneyStore((s) => s.journey);
  const now = useNow();
  if (!journey) return null;
  return (
    <HistoryScreen
      journey={journey}
      now={now}
      onBack={() => {
        router.back();
      }}
    />
  );
}
