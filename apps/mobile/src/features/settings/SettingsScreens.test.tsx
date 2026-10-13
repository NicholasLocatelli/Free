import { DEFAULT_MILESTONE_HOURS, MS_PER_DAY } from "@free/core";
import { fireEvent, screen } from "@testing-library/react-native";
import { newJourney, T0 } from "../../test/fixtures";
import { createMemoryRepository, createMemorySettings } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { GoalsSettingsScreen } from "./GoalsSettingsScreen";
import { MoneySettingsScreen } from "./MoneySettingsScreen";
import { SettingsScreen, THEME_SETTINGS_KEY } from "./SettingsScreen";
import { StartSettingsScreen } from "./StartSettingsScreen";

const press = (name: string) => fireEvent.press(screen.getByRole("button", { name }));
const withJourney = () => ({ repository: createMemoryRepository(newJourney()) });

describe("MoneySettingsScreen", () => {
  const amountLabel = "Quanto spendevi in media ogni volta? (€)";

  it("pre-fills the current baseline and saves a correction", async () => {
    const { store } = await renderApp(<MoneySettingsScreen onBack={jest.fn()} />, withJourney());
    expect(screen.getByLabelText(amountLabel).props.value).toBe("50");
    await fireEvent.changeText(screen.getByLabelText(amountLabel), "12,50");
    await fireEvent.press(screen.getByRole("radio", { name: "Al mese" }));
    await press("Salva");
    expect(await screen.findByText("Salvato.")).toBeOnTheScreen();
    expect(store.getState().journey?.money).toMatchObject({
      enabled: true,
      amountPerSessionMinor: 1250,
      frequencyUnit: "month",
    });
  });

  it("can switch the estimate off (MON-4) and keeps the baseline", async () => {
    const { store } = await renderApp(<MoneySettingsScreen onBack={jest.fn()} />, withJourney());
    await fireEvent.press(screen.getByRole("switch", { name: "Mostra la stima" }));
    await press("Salva");
    await screen.findByText("Salvato.");
    expect(store.getState().journey?.money).toMatchObject({
      enabled: false,
      amountPerSessionMinor: 5000,
    });
  });

  it("explains invalid values", async () => {
    await renderApp(<MoneySettingsScreen onBack={jest.fn()} />, withJourney());
    await fireEvent.changeText(screen.getByLabelText(amountLabel), "tanti");
    await press("Salva");
    expect(screen.getByRole("alert")).toHaveTextContent("Inserisci un importo come 20 o 12,50.");
  });
});

describe("GoalsSettingsScreen", () => {
  it("adds, removes and resets goals (GOAL-1)", async () => {
    const { store } = await renderApp(<GoalsSettingsScreen onBack={jest.fn()} />, withJourney());
    await fireEvent.changeText(screen.getByLabelText("Aggiungi un obiettivo (giorni)"), "45");
    await press("Aggiungi");
    expect(await screen.findByText("45 giorni")).toBeOnTheScreen();
    expect(store.getState().journey?.milestoneHours).toContain(45 * 24);

    await press("Rimuovi 1 giorno");
    expect(store.getState().journey?.milestoneHours).not.toContain(24);

    await press("Ripristina gli obiettivi predefiniti");
    expect(store.getState().journey?.milestoneHours).toEqual([...DEFAULT_MILESTONE_HOURS]);
  });

  it("rejects invalid values", async () => {
    await renderApp(<GoalsSettingsScreen onBack={jest.fn()} />, withJourney());
    await fireEvent.changeText(screen.getByLabelText("Aggiungi un obiettivo (giorni)"), "0");
    await press("Aggiungi");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Inserisci un numero di giorni tra 1 e 36500.",
    );
  });
});

describe("StartSettingsScreen", () => {
  it("corrects the start of the current period", async () => {
    const now = () => T0 + 5 * MS_PER_DAY; // 6 Oct 2026, 22:00 in Rome
    const { store } = await renderApp(<StartSettingsScreen onBack={jest.fn()} now={now} />, {
      ...withJourney(),
      now,
    });
    await fireEvent.changeText(screen.getByLabelText("Quanti giorni fa?"), "7");
    await fireEvent.changeText(screen.getByLabelText("A che ora? (hh:mm)"), "09:00");
    await press("Salva");
    expect(await screen.findByText("Salvato.")).toBeOnTheScreen();
    expect(store.getState().journey?.periods[0]?.startedAt).toBe(Date.UTC(2026, 8, 29, 7, 0));
  });
});

describe("SettingsScreen", () => {
  it("opens sections and saves the theme choice", async () => {
    const onOpen = jest.fn();
    const settings = createMemorySettings();
    await renderApp(<SettingsScreen onOpen={onOpen} onBack={jest.fn()} />, {
      ...withJourney(),
      settings,
    });
    await press("Stima del denaro non speso");
    expect(onOpen).toHaveBeenCalledWith("money");
    await fireEvent.press(screen.getByRole("radio", { name: "Scuro" }));
    expect(screen.getByRole("radio", { name: "Scuro" })).toBeSelected();
    expect(await settings.get(THEME_SETTINGS_KEY)).toBe("dark");
  });
});
