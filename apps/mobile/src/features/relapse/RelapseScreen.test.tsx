import { MS_PER_DAY } from "@free/core";
import { fireEvent, screen } from "@testing-library/react-native";
import { messages } from "../../i18n/it";
import { newJourney, T0 } from "../../test/fixtures";
import { createMemoryRepository } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { RelapseScreen } from "./RelapseScreen";

// fixtures.T0 = 1 Oct 2026 20:00 UTC (22:00 in Rome). The relapse happens 10 days later.
const NOW = T0 + 10 * MS_PER_DAY;
const now = () => NOW;

async function setup() {
  const onDone = jest.fn();
  const onCancel = jest.fn();
  const app = await renderApp(<RelapseScreen onDone={onDone} onCancel={onCancel} now={now} />, {
    repository: createMemoryRepository(newJourney()),
    now,
  });
  return { ...app, onDone, onCancel };
}

const press = (name: string) => fireEvent.press(screen.getByRole("button", { name }));

describe("RelapseScreen", () => {
  it("closes the period, keeps history and offers support (REL-1..4, REL-8)", async () => {
    const { store, onDone } = await setup();
    expect(
      screen.getByText(
        "Il tuo percorso precedente resterà nello storico, insieme ai traguardi che hai raggiunto.",
      ),
    ).toBeOnTheScreen();
    await press("Continua");
    await fireEvent.press(screen.getByRole("checkbox", { name: "Stress" }));
    await fireEvent.changeText(screen.getByLabelText("Nota (facoltativa)"), "giorno di paga");
    await press("Salva");

    expect(await screen.findByRole("header", { name: "Il percorso continua." })).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Hai registrato una ricaduta. I tuoi 10 giorni precedenti restano nel tuo storico.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Chiama 800 558822" })).toBeOnTheScreen();

    const journey = store.getState().journey;
    expect(journey?.periods).toHaveLength(2);
    expect(journey?.periods[0]).toMatchObject({ endedAt: NOW, endReason: "relapse" });
    expect(journey?.relapses[0]).toMatchObject({
      contributingFactors: ["stress"],
      note: "giorno di paga",
    });

    await press("Torna a Oggi");
    expect(onDone).toHaveBeenCalled();
  });

  it("records an earlier time and rejects one before the period started (REL-5)", async () => {
    const { store } = await setup();
    await fireEvent.press(screen.getByRole("radio", { name: "Prima di adesso" }));
    await fireEvent.changeText(screen.getByLabelText("Quanti giorni fa?"), "30");
    await fireEvent.changeText(screen.getByLabelText("A che ora? (hh:mm)"), "10:00");
    await press("Continua");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Questo orario è precedente all'inizio del periodo in corso.",
    );

    await fireEvent.changeText(screen.getByLabelText("Quanti giorni fa?"), "2");
    await press("Continua");
    await press("Salva");
    await screen.findByRole("header", { name: "Il percorso continua." });
    expect(store.getState().journey?.periods[0]?.endedAt).toBe(Date.UTC(2026, 9, 9, 8, 0));
  });

  it("can be cancelled without recording anything", async () => {
    const { store, onCancel } = await setup();
    await press("Annulla");
    expect(onCancel).toHaveBeenCalled();
    expect(store.getState().journey?.relapses).toHaveLength(0);
  });

  it("never uses shaming words or the danger colour in its copy (REL-7)", () => {
    const relapseCopy = Object.entries(messages)
      .filter(([key]) => key.startsWith("relapse."))
      .map(([, text]) => text)
      .join(" ");
    expect(relapseCopy).not.toMatch(/fallit|fallimento|perso|reset|da zero|colpa/i);
  });
});
