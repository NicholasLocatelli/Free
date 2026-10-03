import { createJourney, type Journey } from "@free/core";
import { useState } from "react";
import { TodayScreen } from "../src/features/today/TodayScreen";
import { useNow } from "../src/platform/useNow";

/**
 * Temporary in-memory journey started at launch, so the scaffold exercises the real
 * domain engine. Replaced by the SQLite-backed store and onboarding in #3/#4.
 */
function createScaffoldJourney(): Journey {
  const now = Date.now();
  const result = createJourney({
    id: "scaffold",
    periodId: "scaffold-period",
    categoryId: "gambling",
    startedAt: now,
    now,
  });
  if (!result.ok) throw new Error(`Scaffold journey failed: ${result.error}`);
  return result.value;
}

export default function Index() {
  const [journey] = useState(createScaffoldJourney);
  const now = useNow();
  return <TodayScreen journey={journey} now={now} />;
}
