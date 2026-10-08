import { createContext, useContext, type ReactNode } from "react";
import { useStore } from "zustand";
import type { JourneyState, JourneyStore } from "./journeyStore";

const JourneyStoreContext = createContext<JourneyStore | null>(null);

export function JourneyStoreProvider({
  store,
  children,
}: {
  store: JourneyStore;
  children: ReactNode;
}) {
  return <JourneyStoreContext value={store}>{children}</JourneyStoreContext>;
}

export function useJourneyStore<T>(selector: (state: JourneyState) => T): T {
  const store = useContext(JourneyStoreContext);
  if (!store) throw new Error("useJourneyStore must be used inside <JourneyStoreProvider>");
  return useStore(store, selector);
}
