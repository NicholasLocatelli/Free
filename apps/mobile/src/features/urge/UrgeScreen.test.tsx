import { fireEvent, screen } from "@testing-library/react-native";
import { newJourney } from "../../test/fixtures";
import { createMemoryRepository } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { UrgeScreen } from "./UrgeScreen";

async function setup() {
  const callbacks = { onDone: jest.fn(), onRelapse: jest.fn(), onCancel: jest.fn() };
  const app = await renderApp(<UrgeScreen {...callbacks} />, {
    repository: createMemoryRepository(newJourney()),
  });
  return { ...app, ...callbacks };
}

const press = (name: string) => fireEvent.press(screen.getByRole("button", { name }));
const choose = (role: "radio" | "checkbox", name: string) =>
  fireEvent.press(screen.getByRole(role, { name }));

describe("UrgeScreen", () => {
  it("records a resisted urge with all details and counts it (URG-1, URG-2)", async () => {
    const { store, onDone } = await setup();
    await choose("radio", "8");
    await choose("radio", "Noia");
    await fireEvent.changeText(
      screen.getByLabelText("Quanto è durato? (minuti, facoltativo)"),
      "15",
    );
    await choose("checkbox", "Respirare");
    await choose("checkbox", "Chiamare qualcuno");
    await fireEvent.changeText(screen.getByLabelText("Nota (facoltativa)"), "dopo la partita");
    await press("Salva");

    expect(
      await screen.findByRole("header", { name: "Hai superato un impulso. Sono 1 finora." }),
    ).toBeOnTheScreen();
    expect(store.getState().journey?.urges[0]).toMatchObject({
      intensity: 8,
      trigger: "boredom",
      durationMinutes: 15,
      copingActions: ["breathing", "called_someone"],
      outcome: "resisted",
      note: "dopo la partita",
    });
    await press("Torna a Oggi");
    expect(onDone).toHaveBeenCalled();
  });

  it("requires an intensity", async () => {
    const { store } = await setup();
    await press("Salva");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Scegli quanto è forte l'impulso, da 1 a 10.",
    );
    expect(store.getState().journey?.urges).toHaveLength(0);
  });

  it("explains an invalid duration (URG-3)", async () => {
    await setup();
    await choose("radio", "3");
    await fireEvent.changeText(
      screen.getByLabelText("Quanto è durato? (minuti, facoltativo)"),
      "1441",
    );
    await press("Salva");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Inserisci i minuti come numero intero, da 0 a 1440.",
    );
  });

  it("offers the relapse flow without starting it when the user gambled (URG-5)", async () => {
    const { store, onRelapse, onDone } = await setup();
    await choose("radio", "6");
    await choose("radio", "Sì");
    await press("Salva");
    expect(
      await screen.findByText("Grazie per averlo registrato. Vuoi registrare anche una ricaduta?"),
    ).toBeOnTheScreen();
    expect(store.getState().journey?.periods).toHaveLength(1);
    await press("Registra una ricaduta");
    expect(onRelapse).toHaveBeenCalled();
    await press("Non ora");
    expect(onDone).toHaveBeenCalled();
  });

  it("uses one id per opened form, so a re-submit cannot duplicate the urge (URG-4)", async () => {
    const { store } = await setup();
    await choose("radio", "5");
    await press("Salva");
    await screen.findByRole("header", { name: "Hai superato un impulso. Sono 1 finora." });
    const saved = store.getState().journey?.urges[0];
    if (!saved) throw new Error("urge not saved");
    expect(
      await store
        .getState()
        .recordUrge({ id: saved.id, occurredAt: 0, intensity: 5, outcome: "resisted" }),
    ).toEqual({ ok: false, error: "duplicate_id" });
    expect(store.getState().journey?.urges).toHaveLength(1);
  });
});
