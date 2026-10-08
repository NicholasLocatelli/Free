import { DEFAULT_MILESTONE_HOURS } from "@free/core";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import type { JourneyRepository } from "../../data/JourneyRepository";
import { createMemoryRepository, createMemorySettings } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { OnboardingFlow } from "./OnboardingFlow";
import { ONBOARDING_SETTINGS_KEY, serializeProgress, INITIAL_PROGRESS } from "./onboardingModel";

// TZ=Europe/Rome. 8 Oct 2026, 20:30 local.
const NOW = Date.UTC(2026, 9, 8, 18, 30);
const now = () => NOW;

const press = (name: string) => fireEvent.press(screen.getByRole("button", { name }));
const choose = (name: string) => fireEvent.press(screen.getByRole("radio", { name }));

/** Saving is async: wait until the store holds the journey created by the last step. */
async function journeyOf(store: Awaited<ReturnType<typeof renderApp>>["store"]) {
  await waitFor(() => {
    expect(store.getState().journey).not.toBeNull();
  });
  return store.getState().journey;
}

async function goToStep(steps: number) {
  for (let i = 0; i < steps; i++) {
    await press(i === 0 ? "Inizia" : "Continua");
  }
}

describe("OnboardingFlow", () => {
  it("completes with defaults in five steps and creates the journey (ONB-1)", async () => {
    const { store, settings } = await renderApp(<OnboardingFlow now={now} />, { now });
    expect(await screen.findByText("Passo 1 di 5")).toBeOnTheScreen();
    expect(
      screen.getByText("Non è una terapia e non sostituisce un professionista."),
    ).toBeOnTheScreen();

    await goToStep(4);
    expect(
      screen.getByRole("header", { name: "Vuoi vedere una stima del denaro non speso?" }),
    ).toBeOnTheScreen();
    await press("Inizia il percorso");

    const journey = await journeyOf(store);
    expect(journey?.periods[0]?.startedAt).toBe(NOW);
    expect(journey?.milestoneHours).toEqual([...DEFAULT_MILESTONE_HOURS]);
    expect(journey?.money.enabled).toBe(false);
    await waitFor(async () => {
      expect(await settings.get(ONBOARDING_SETTINGS_KEY)).toBeNull();
    });
  });

  it("starts in the past and from the chosen first goal, with a money baseline", async () => {
    const { store } = await renderApp(<OnboardingFlow now={now} />, { now });
    await screen.findByText("Passo 1 di 5");
    await goToStep(2);

    await choose("Prima di adesso");
    await fireEvent.changeText(screen.getByLabelText("Quanti giorni fa?"), "2");
    await fireEvent.changeText(screen.getByLabelText("A che ora? (hh:mm)"), "21:40");
    expect(screen.getByText("Inizio: 6 ottobre alle ore 21:40")).toBeOnTheScreen();
    await press("Continua");

    await choose("7 giorni");
    await press("Continua");

    await fireEvent.press(screen.getByRole("switch", { name: "Mostra la stima" }));
    await fireEvent.changeText(
      screen.getByLabelText("Quanto spendevi in media ogni volta? (€)"),
      "12,50",
    );
    await fireEvent.changeText(screen.getByLabelText("Quante volte?"), "3");
    await choose("Al mese");
    await press("Inizia il percorso");

    const journey = await journeyOf(store);
    expect(journey?.periods[0]?.startedAt).toBe(Date.UTC(2026, 9, 6, 19, 40));
    expect(journey?.milestoneHours[0]).toBe(168);
    expect(journey?.money).toEqual({
      enabled: true,
      currency: "EUR",
      amountPerSessionMinor: 1250,
      sessionsPerUnit: 3,
      frequencyUnit: "month",
    });
  });

  it("blocks a start in the future with an explanation (ONB-3)", async () => {
    await renderApp(<OnboardingFlow now={now} />, { now });
    await screen.findByText("Passo 1 di 5");
    await goToStep(2);
    await choose("Prima di adesso");
    await fireEvent.changeText(screen.getByLabelText("Quanti giorni fa?"), "0");
    await fireEvent.changeText(screen.getByLabelText("A che ora? (hh:mm)"), "23:00");
    await press("Continua");
    expect(screen.getByRole("alert")).toHaveTextContent("L'inizio non può essere nel futuro.");
    expect(screen.getByText("Passo 3 di 5")).toBeOnTheScreen();
  });

  it("explains invalid money values instead of saving them", async () => {
    const { store } = await renderApp(<OnboardingFlow now={now} />, { now });
    await screen.findByText("Passo 1 di 5");
    await goToStep(4);
    await fireEvent.press(screen.getByRole("switch", { name: "Mostra la stima" }));
    await fireEvent.changeText(
      screen.getByLabelText("Quanto spendevi in media ogni volta? (€)"),
      "tanti",
    );
    await press("Inizia il percorso");
    expect(screen.getByRole("alert")).toHaveTextContent("Inserisci un importo come 20 o 12,50.");
    expect(store.getState().journey).toBeNull();
  });

  it("resumes from the saved step after the app was closed (ONB-5)", async () => {
    const settings = createMemorySettings({
      [ONBOARDING_SETTINGS_KEY]: serializeProgress({
        step: "goal",
        draft: { ...INITIAL_PROGRESS.draft, firstGoalHours: 720 },
      }),
    });
    await renderApp(<OnboardingFlow now={now} />, { now, settings });
    expect(await screen.findByText("Passo 4 di 5")).toBeOnTheScreen();
    expect(screen.getByRole("radio", { name: "30 giorni" })).toBeSelected();
  });

  it("saves progress as the user moves, and goes back without losing the draft", async () => {
    const { settings } = await renderApp(<OnboardingFlow now={now} />, { now });
    await screen.findByText("Passo 1 di 5");
    await goToStep(3);
    await choose("3 giorni");
    await press("Indietro");
    expect(screen.getByText("Passo 3 di 5")).toBeOnTheScreen();
    await press("Continua");
    expect(screen.getByRole("radio", { name: "3 giorni" })).toBeSelected();
    expect(await settings.get(ONBOARDING_SETTINGS_KEY)).toContain('"firstGoalHours":72');
  });

  it("reports a start that became invalid by the time of saving (clock moved back)", async () => {
    let clock = NOW;
    await renderApp(<OnboardingFlow now={() => NOW} />, { now: () => clock });
    await screen.findByText("Passo 1 di 5");
    await goToStep(4);
    clock = NOW - 60_000;
    await press("Inizia il percorso");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "L'inizio non può essere nel futuro.",
    );
  });

  it("shows a save error and keeps the user on the last step", async () => {
    const repository: JourneyRepository = {
      ...createMemoryRepository(),
      save: () => Promise.reject(new Error("disk full")),
    };
    await renderApp(<OnboardingFlow now={now} />, { now, repository });
    await screen.findByText("Passo 1 di 5");
    await goToStep(4);
    await press("Inizia il percorso");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Non è stato possibile salvare. Riprova.",
    );
  });
});
