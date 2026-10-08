import type { JourneyRepository } from "../data/JourneyRepository";
import type { SettingsRepository } from "../data/SettingsRepository";
import { createJourneyStore } from "../state/journeyStore";
import { JourneyStoreProvider } from "../state/JourneyStoreProvider";
import { SettingsProvider } from "../state/SettingsProvider";
import { idSequence } from "./fixtures";
import { createMemoryRepository, createMemorySettings } from "./memoryRepository";
import { renderWithTheme } from "./render";
import type { ReactElement } from "react";

interface Options {
  repository?: JourneyRepository;
  settings?: SettingsRepository;
  now?: () => number;
  load?: boolean;
}

/** Renders `ui` with the real store and theme, backed by in-memory repositories. */
export async function renderApp(ui: ReactElement, options: Options = {}) {
  const repository = options.repository ?? createMemoryRepository();
  const settings = options.settings ?? createMemorySettings();
  const store = createJourneyStore({
    repository,
    now: options.now ?? Date.now,
    newId: idSequence(),
  });
  if (options.load ?? true) await store.getState().load();
  await renderWithTheme(
    <JourneyStoreProvider store={store}>
      <SettingsProvider settings={settings}>{ui}</SettingsProvider>
    </JourneyStoreProvider>,
  );
  return { store, repository, settings };
}
