import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { getLanguage, setLanguage } from "../../i18n";
import { newJourney } from "../../test/fixtures";
import { createMemoryRepository, createMemorySettings } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { SettingsScreen } from "../settings/SettingsScreen";
import { COUNTRY_SETTINGS_KEY, LANGUAGE_SETTINGS_KEY, useLocale } from "./LocaleProvider";

function Probe() {
  const { language, country } = useLocale();
  return <Text>{`${language}/${country ?? "none"}`}</Text>;
}

const withJourney = () => ({ repository: createMemoryRepository(newJourney()) });

afterEach(() => {
  setLanguage("it");
});

describe("LocaleProvider", () => {
  it("follows the phone: language and country with verified resources", async () => {
    await renderApp(<Probe />, { ...withJourney(), device: { languages: ["it"], region: "IT" } });
    expect(screen.getByText("it/IT")).toBeOnTheScreen();
  });

  it("falls back to English and to no country when neither is supported", async () => {
    await renderApp(<Probe />, {
      ...withJourney(),
      device: { languages: ["de"], region: "DE" },
    });
    expect(screen.getByText("en/none")).toBeOnTheScreen();
    expect(getLanguage()).toBe("en");
  });

  it("keeps language and country independent (an English speaker in Italy)", async () => {
    await renderApp(<Probe />, { ...withJourney(), device: { languages: ["en"], region: "IT" } });
    expect(screen.getByText("en/IT")).toBeOnTheScreen();
  });

  it("applies saved choices over the phone's", async () => {
    const settings = createMemorySettings({
      [LANGUAGE_SETTINGS_KEY]: "en",
      [COUNTRY_SETTINGS_KEY]: "none",
    });
    await renderApp(<Probe />, { ...withJourney(), settings });
    expect(await screen.findByText("en/none")).toBeOnTheScreen();
  });
});

describe("Settings: language and country", () => {
  it("switches to English and saves the choice", async () => {
    const settings = createMemorySettings();
    await renderApp(<SettingsScreen onOpen={jest.fn()} onBack={jest.fn()} />, {
      ...withJourney(),
      settings,
    });
    await fireEvent.press(screen.getByRole("radio", { name: "English" }));
    await waitFor(async () => {
      expect(await settings.get(LANGUAGE_SETTINGS_KEY)).toBe("en");
    });
    expect(getLanguage()).toBe("en");
  });

  it("lets the user pick a country without verified resources", async () => {
    const settings = createMemorySettings();
    await renderApp(<SettingsScreen onOpen={jest.fn()} onBack={jest.fn()} />, {
      ...withJourney(),
      settings,
    });
    expect(screen.getByRole("radio", { name: "Automatico" })).toBeSelected();
    await fireEvent.press(screen.getByRole("radio", { name: "Altro paese" }));
    await waitFor(async () => {
      expect(await settings.get(COUNTRY_SETTINGS_KEY)).toBe("none");
    });
  });
});
