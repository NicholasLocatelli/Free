import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderWithTheme } from "../../test/render";
import { SosScreen, WAIT_SECONDS, type SosHelpline } from "./SosScreen";

const TELEFONO_VERDE: SosHelpline = {
  name: "il Telefono Verde",
  phone: "800 558822",
  hours: "Lunedì–venerdì, 10:00–16:00 · gratuito e anonimo",
};

describe("SosScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  function setup(
    openUrl = jest.fn(() => Promise.resolve()),
    helpline: SosHelpline | null = TELEFONO_VERDE,
  ) {
    let clock = 0;
    const onRecord = jest.fn();
    const onClose = jest.fn();
    const onHelp = jest.fn();
    const utils = renderWithTheme(
      <SosScreen
        onRecord={onRecord}
        onHelp={onHelp}
        onClose={onClose}
        helpline={helpline}
        openUrl={openUrl}
        now={() => clock}
      />,
    );
    const advance = async (seconds: number) => {
      clock += seconds * 1000;
      await act(async () => {
        jest.advanceTimersByTime(seconds * 1000);
        await Promise.resolve();
      });
    };
    return { utils, onRecord, onHelp, onClose, openUrl, advance };
  }

  it("offers techniques, the helpline and recording in one place", async () => {
    const { utils, onRecord } = setup();
    await utils;
    expect(
      screen.getByRole("header", { name: "Questo momento passerà. Proviamo insieme." }),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Registra l'impulso" }));
    expect(onRecord).toHaveBeenCalled();
  });

  it("links to the full Help Center", async () => {
    const { utils, onHelp } = setup();
    await utils;
    await fireEvent.press(screen.getByRole("button", { name: "Altre risorse di aiuto" }));
    expect(onHelp).toHaveBeenCalled();
  });

  it("dials the verified national helpline", async () => {
    const { utils, openUrl } = setup();
    await utils;
    await fireEvent.press(
      screen.getByRole("button", { name: "Chiama il Telefono Verde 800 558822" }),
    );
    expect(openUrl).toHaveBeenCalledWith("tel:800558822");
  });

  it("shows the helpline's hours", async () => {
    const { utils } = setup();
    await utils;
    expect(screen.getByText(TELEFONO_VERDE.hours ?? "")).toBeOnTheScreen();
  });

  it("offers no call when the country has no verified helpline", async () => {
    const { utils } = setup(undefined, null);
    await utils;
    expect(screen.queryByRole("button", { name: /^Chiama/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Altre risorse di aiuto" })).toBeOnTheScreen();
  });

  it("shows the number when the phone app cannot be opened", async () => {
    const { utils } = setup(jest.fn(() => Promise.reject(new Error("no dialer"))));
    await utils;
    await fireEvent.press(
      screen.getByRole("button", { name: "Chiama il Telefono Verde 800 558822" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(/800 558822/);
  });

  it("guides breathing with alternating phases", async () => {
    const { utils, advance } = setup();
    await utils;
    await fireEvent.press(screen.getByRole("button", { name: "Respira per un minuto" }));
    expect(screen.getByText("Inspira lentamente")).toBeOnTheScreen();
    await advance(4);
    expect(screen.getByText("Espira lentamente")).toBeOnTheScreen();
  });

  it("counts down 15 minutes from the start instant and then offers to record", async () => {
    const { utils, advance, onRecord } = setup();
    await utils;
    await fireEvent.press(screen.getByRole("button", { name: "Aspetta 15 minuti" }));
    expect(screen.getByText("15:00")).toBeOnTheScreen();
    await advance(WAIT_SECONDS);
    expect(
      screen.getByRole("header", { name: "Ce l'hai fatta ad aspettare. Come va adesso?" }),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Registra l'impulso" }));
    expect(onRecord).toHaveBeenCalled();
  });

  it("can stop a guided exercise", async () => {
    const { utils } = setup();
    await utils;
    await fireEvent.press(screen.getByRole("button", { name: "Aspetta 15 minuti" }));
    await fireEvent.press(screen.getByRole("button", { name: "Interrompi" }));
    expect(screen.getByRole("button", { name: "Respira per un minuto" })).toBeOnTheScreen();
  });
});
