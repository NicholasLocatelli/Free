import { createContext, useContext, type ReactNode } from "react";
import type { SettingsRepository } from "../data/SettingsRepository";

const SettingsContext = createContext<SettingsRepository | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: SettingsRepository;
  children: ReactNode;
}) {
  return <SettingsContext value={settings}>{children}</SettingsContext>;
}

export function useSettings(): SettingsRepository {
  const settings = useContext(SettingsContext);
  if (!settings) throw new Error("useSettings must be used inside <SettingsProvider>");
  return settings;
}
