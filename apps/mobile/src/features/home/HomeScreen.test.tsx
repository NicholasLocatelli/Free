import { fireEvent, screen } from "@testing-library/react-native";
import type { JourneyRepository } from "../../data/JourneyRepository";
import { createJourneyStore } from "../../state/journeyStore";
import { JourneyStoreProvider } from "../../state/JourneyStoreProvider";
import { idSequence, newJourney } from "../../test/fixtures";
import { createMemoryRepository } from "../../test/memoryRepository";
import { renderWithTheme } from "../../test/render";
import { HomeScreen } from "./HomeScreen";

async function renderHome(repository: JourneyRepository, load = true) {
  const store = createJourneyStore({ repository, now: Date.now, newId: idSequence() });
  if (load) await store.getState().load();
  await renderWithTheme(
    <JourneyStoreProvider store={store}>
      <HomeScreen />
    </JourneyStoreProvider>,
  );
  return store;
}

describe("HomeScreen", () => {
  it("shows a loading indicator while booting", async () => {
    await renderHome(createMemoryRepository(), false);
    expect(screen.getByLabelText("Caricamento")).toBeOnTheScreen();
  });

  it("offers to start when there is no journey, then shows the dashboard", async () => {
    const repository = createMemoryRepository();
    await renderHome(repository);
    await fireEvent.press(screen.getByRole("button", { name: "Inizia adesso" }));
    expect(await screen.findByText("0 giorni")).toBeOnTheScreen();
    expect(await repository.load()).not.toBeNull();
  });

  it("shows the stored journey after a restart", async () => {
    await renderHome(createMemoryRepository(newJourney()));
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
    await renderHome(repository);
    expect(screen.getByText("Non riusciamo a leggere i dati")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Riprova" }));
    expect(await screen.findByRole("header", { name: "Oggi" })).toBeOnTheScreen();
  });

  it("tells the user when saving fails", async () => {
    const repository: JourneyRepository = {
      ...createMemoryRepository(),
      save: () => Promise.reject(new Error("disk full")),
    };
    await renderHome(repository);
    await fireEvent.press(screen.getByRole("button", { name: "Inizia adesso" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Non è stato possibile salvare. Riprova.",
    );
  });
});
