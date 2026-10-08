import { screen } from "@testing-library/react-native";
import type { JourneyRepository } from "../../data/JourneyRepository";
import { fireEvent } from "@testing-library/react-native";
import { newJourney } from "../../test/fixtures";
import { createMemoryRepository } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { HomeScreen } from "./HomeScreen";

describe("HomeScreen", () => {
  it("shows a loading indicator while booting", async () => {
    await renderApp(<HomeScreen />, { load: false });
    expect(screen.getByLabelText("Caricamento")).toBeOnTheScreen();
  });

  it("starts onboarding when there is no journey", async () => {
    await renderApp(<HomeScreen />);
    expect(
      await screen.findByRole("header", {
        name: "Uno spazio privato per seguire il tuo percorso.",
      }),
    ).toBeOnTheScreen();
  });

  it("shows the stored journey after a restart", async () => {
    await renderApp(<HomeScreen />, { repository: createMemoryRepository(newJourney()) });
    expect(screen.getByRole("header", { name: "Oggi" })).toBeOnTheScreen();
  });

  it("shows an error with retry when data cannot be read, without deleting anything", async () => {
    let attempts = 0;
    const journey = newJourney();
    const repository: JourneyRepository = {
      ...createMemoryRepository(journey),
      load: () =>
        ++attempts === 1 ? Promise.reject(new Error("corrupt")) : Promise.resolve(journey),
    };
    await renderApp(<HomeScreen />, { repository });
    expect(screen.getByText("Non riusciamo a leggere i dati")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Riprova" }));
    expect(await screen.findByRole("header", { name: "Oggi" })).toBeOnTheScreen();
  });
});
