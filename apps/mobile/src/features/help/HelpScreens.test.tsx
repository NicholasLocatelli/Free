import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithTheme } from "../../test/render";
import { setLanguage } from "../../i18n";
import { getHelpSection, getHelpSections } from "./content";
import { HelpScreen } from "./HelpScreen";
import { HelpSectionScreen } from "./HelpSectionScreen";

function section(id: string) {
  const found = getHelpSection(id, "IT");
  if (!found) throw new Error(`missing section ${id}`);
  return found;
}

describe("HelpScreen", () => {
  it("lists every section and opens it (HELP-1)", async () => {
    const onOpen = jest.fn();
    const sections = getHelpSections("IT");
    await renderWithTheme(
      <HelpScreen sections={sections} hasCountry onOpen={onOpen} onBack={jest.fn()} />,
    );
    expect(screen.getByRole("header", { name: "Aiuto" })).toBeOnTheScreen();
    expect(screen.queryByText("Nessuna risorsa verificata per il tuo paese")).toBeNull();
    for (const s of sections) {
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
      screen.getByText("Fonte: Istituto Superiore di Sanità · verificato il 7 novembre 2026"),
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
    expect(getHelpSection("nope", "IT")).toBeUndefined();
  });
});

describe("a country without verified resources", () => {
  it("says so and never shows another country's numbers", async () => {
    const sections = getHelpSections(null);
    await renderWithTheme(
      <HelpScreen sections={sections} hasCountry={false} onOpen={jest.fn()} onBack={jest.fn()} />,
    );
    expect(screen.getByText("Nessuna risorsa verificata per il tuo paese")).toBeOnTheScreen();
    expect(sections.every((s) => s.resources.length === 0)).toBe(true);
    const text = sections.flatMap((s) => s.body).join(" ");
    expect(text).not.toMatch(/Italia|Ser\.D|112/);
  });
});

describe("in English", () => {
  afterEach(() => {
    setLanguage("it");
  });

  it("shows English guidance with Italy's resources described in English", async () => {
    setLanguage("en");
    await renderWithTheme(<HelpSectionScreen section={section("emergency")} onBack={jest.fn()} />);
    expect(screen.getByRole("header", { name: "If you are in danger" })).toBeOnTheScreen();
    expect(screen.getByText("In Italy the single emergency number is 112.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Call 112" })).toBeOnTheScreen();
    expect(screen.getAllByText(/Source: .* · checked on 7 November 2026/)).toHaveLength(2);
  });
});
