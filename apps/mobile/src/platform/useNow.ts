import type { Instant } from "@free/core";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

/** The timer shows minutes, so a 60 s tick is enough (less battery, less visual noise). */
export const NOW_TICK_MS = 60_000;

/**
 * Current instant for read models. Elapsed time is always recomputed from stored
 * instants, so this hook only decides how often the UI refreshes: every tick and
 * immediately when the app returns to the foreground.
 */
export function useNow(clock: () => Instant = Date.now): Instant {
  const [now, setNow] = useState(clock);

  useEffect(() => {
    const refresh = () => {
      setNow(clock());
    };
    const interval = setInterval(refresh, NOW_TICK_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [clock]);

  return now;
}
