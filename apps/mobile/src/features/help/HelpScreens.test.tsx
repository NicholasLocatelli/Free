import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithTheme } from "../../test/render";
import { getHelpSection, HELP_SECTIONS } from "./content";
import { HelpScreen } from "./HelpScreen";
import { HelpSectionScreen } from "./HelpSectionScreen";

function section(id: string) {
  const found = getHelpSection(id);
  if (!found) throw new Error(`missing section ${id}`);
  return found;
}

describe("HelpScreen", () => {
  it("lists every section and opens it (HELP-1)", async () => {
    const onOpen = jest.fn();
    await renderWithTheme(<HelpScreen onOpen={onOpen} onBack={jest.fn()} />);
    expect(screen.getByRole("header", { name: "Aiuto" })).toBeOnTheScreen();
    for (const s of HELP_SECTIONS) {
      expect(screen.getByRole("button", { name: `${s.title}. ${s.summary}` })).toBeOnTheScreen();
    }
    await fireEvent.press(screen.getByRole("button", { name: /^Se sei in pericolo/ }));
    expect(onOpen).toHaveBeenCalledWith("emergency");
  });
});

describe("HelpSectionScreen", () => {
  it("shows guidance and resources with source and verification date (HELP-2)", async () => {
    await renderWithTheme(<HelpSectionScreen section={section("urge")} onBack={jest.fn()} />);
    expect(screen.getByRole("header", { name: "Ho un impulso adesso" })).toBeOnTheScreen();
    expect(
      screen.getByText("Aspetta 15 minuti e osserva l'impulso senza agire."),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Chiama 800 558822" })).toBeOnTheScreen();
    expect(
      screen.getByText("Fonte: Istituto Superiore di Sanità · verificato il 18 ottobre"),
    ).toBeOnTheScreen();
  });

  it("offers 112 and a listening line in the emergency section", async () => {
    const openUrl = jest.fn(() => Promise.resolve());
    await renderWithTheme(
      <HelpSectionScreen section={section("emergency")} onBack={jest.fn()} openUrl={openUrl} />,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Chiama 112" }));
    expect(openUrl).toHaveBeenCalledWith("tel:112");
    expect(screen.getByRole("button", { name: "Chiama 02 2327 2327" })).toBeOnTheScreen();
  });

  it("renders the FAQ", async () => {
    await renderWithTheme(<HelpSectionScreen section={section("faq")} onBack={jest.fn()} />);
    expect(screen.getByRole("header", { name: "Se ricado perdo tutto?" })).toBeOnTheScreen();
  });

  it("returns undefined for unknown sections (route redirects)", () => {
    expect(getHelpSection("nope")).toBeUndefined();
  });
});
