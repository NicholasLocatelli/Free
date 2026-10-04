import { MS_PER_HOUR } from "@free/core";
import { fireEvent, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { renderWithTheme } from "../../test/render";
import { Button } from "./Button";
import { MilestoneCard } from "./MilestoneCard";
import { ResourceCard, type Resource } from "./ResourceCard";
import { Sheet } from "./Sheet";
import { Stat } from "./Stat";
import { EmptyState, ErrorState } from "./StateMessage";
import { Timer } from "./Timer";

const T0 = Date.UTC(2026, 9, 3, 10, 0);

describe("Timer", () => {
  it("reads as one sentence for screen readers", async () => {
    await renderWithTheme(<Timer parts={{ days: 12, hours: 4, minutes: 17, seconds: 9 }} />);
    expect(screen.getByLabelText("12 giorni, 4 ore e 17 minuti")).toBeOnTheScreen();
    expect(screen.queryByText(/9/)).toBeNull();
  });
});

describe("Stat", () => {
  it("combines label, value and caption", async () => {
    await renderWithTheme(<Stat label="Impulsi superati" value="9" caption="finora" />);
    expect(screen.getByLabelText("Impulsi superati, 9, finora")).toBeOnTheScreen();
  });
});

describe("MilestoneCard", () => {
  it("states the status in text", async () => {
    await renderWithTheme(
      <>
        <MilestoneCard hours={24} status="reached" achievedAt={T0 + 24 * MS_PER_HOUR} />
        <MilestoneCard hours={168} status="next" />
        <MilestoneCard hours={36} status="future" />
      </>,
    );
    expect(screen.getByLabelText("1 giorno, Raggiunto il 4 ottobre")).toBeOnTheScreen();
    expect(screen.getByLabelText("7 giorni, Prossimo obiettivo")).toBeOnTheScreen();
    expect(screen.getByLabelText("36 ore, Da raggiungere")).toBeOnTheScreen();
  });
});

describe("ResourceCard", () => {
  const resource: Resource = {
    name: "Servizio",
    description: "Descrizione",
    phone: "800 123456",
    url: "https://example.org",
    source: "Fonte",
    verifiedAt: T0,
  };

  it("dials the number without spaces and shows source and verification date", async () => {
    const openUrl = jest.fn(() => Promise.resolve());
    await renderWithTheme(<ResourceCard resource={resource} openUrl={openUrl} />);
    await fireEvent.press(screen.getByRole("button", { name: "Chiama 800 123456" }));
    expect(openUrl).toHaveBeenCalledWith("tel:800123456");
    expect(screen.getByText("Fonte: Fonte · verificato il 3 ottobre")).toBeOnTheScreen();
  });

  it("shows the number as text when the link cannot be opened", async () => {
    const openUrl = jest.fn(() => Promise.reject(new Error("no handler")));
    await renderWithTheme(<ResourceCard resource={resource} openUrl={openUrl} />);
    await fireEvent.press(screen.getByRole("button", { name: "Apri il sito" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Non è stato possibile aprire il collegamento. Numero: 800 123456",
    );
  });
});

describe("EmptyState / ErrorState", () => {
  it("renders title, body and actions", async () => {
    const onRetry = jest.fn();
    await renderWithTheme(
      <>
        <EmptyState title="Vuoto" body="Niente qui" />
        <ErrorState title="Errore" actions={<Button label="Riprova" onPress={onRetry} />} />
      </>,
    );
    expect(screen.getByRole("header", { name: "Vuoto" })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Riprova" }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("Sheet", () => {
  it("shows a title and closes via the explicit button", async () => {
    const onClose = jest.fn();
    await renderWithTheme(
      <Sheet visible title="Titolo" onClose={onClose}>
        <Text>Contenuto</Text>
      </Sheet>,
    );
    expect(screen.getByText("Contenuto")).toBeOnTheScreen();
    // The scrim is hidden from assistive tech by accessibilityViewIsModal: one close button.
    await fireEvent.press(screen.getByRole("button", { name: "Chiudi" }));
    expect(onClose).toHaveBeenCalled();
  });
});
