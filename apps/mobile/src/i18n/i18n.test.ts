import { formatDuration, formatGoal, formatMoney, spellDigits } from "./format";
import { formatElapsed } from "./formatElapsed";
import { count, LANGUAGES, resolveLanguage, setLanguage, t } from "./index";
import { en } from "./en";
import { messages } from "./it";

afterEach(() => {
  setLanguage("it");
});

describe("t", () => {
  it("interpolates placeholders and leaves unknown ones visible", () => {
    expect(t("urge.resisted", { n: 3 })).toBe(
      "Hai superato un impulso. Impulsi superati finora: 3.",
    );
    expect(t("urge.resisted")).toBe("Hai superato un impulso. Impulsi superati finora: {n}.");
  });

  it("switches language", () => {
    setLanguage("en");
    expect(t("today.title")).toBe("Today");
  });
});

describe("catalogs", () => {
  const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  it("every English text keeps the same placeholders as the Italian source", () => {
    for (const [key, text] of Object.entries(messages)) {
      const translated = en[key as keyof typeof messages];
      expect(translated.trim()).not.toBe("");
      expect([key, placeholders(translated)]).toEqual([key, placeholders(text)]);
    }
  });
});

describe("tone of voice", () => {
  it("never uses shaming or clinical-promise words", () => {
    const forbidden =
      /fallit|fallimento|hai perso|reset|da zero|guarir|jackpot|failure|failed|you lost|shame|cure/i;
    for (const text of [...Object.values(messages), ...Object.values(en)]) {
      expect(text).not.toMatch(forbidden);
    }
  });
});

describe("language of the phone", () => {
  it("uses the first supported language, else English", () => {
    expect(resolveLanguage(["it", "en"])).toBe("it");
    expect(resolveLanguage(["de", "en"])).toBe("en");
    expect(resolveLanguage(["de", null])).toBe("en");
    expect(resolveLanguage([])).toBe("en");
    expect(LANGUAGES).toContain(resolveLanguage(["fr"]));
  });
});

describe("format", () => {
  it("formats goals in days or hours", () => {
    expect(formatGoal(24)).toBe("1 giorno");
    expect(formatGoal(168)).toBe("7 giorni");
    expect(formatGoal(36)).toBe("36 ore");
    expect(formatGoal(1)).toBe("1 ora");
  });

  it("uses the language's plural forms", () => {
    expect(count("period", 1)).toBe("1 periodo");
    expect(count("urge", 0)).toBe("0 impulsi");
    setLanguage("en");
    expect(formatGoal(24)).toBe("1 day");
    expect(formatDuration(5 * 60_000)).toBe("5 minutes");
    expect(count("urge", 1)).toBe("1 urge");
    expect(formatElapsed({ days: 2, hours: 1, minutes: 0, seconds: 0 }).accessibilityLabel).toBe(
      "2 days, 1 hour and 0 minutes",
    );
  });

  it("still works on engines without Intl.PluralRules", () => {
    const original = Object.getOwnPropertyDescriptor(Intl, "PluralRules");
    Object.defineProperty(Intl, "PluralRules", { value: undefined, configurable: true });
    try {
      expect(count("day", 1)).toBe("1 giorno");
      expect(count("day", 2)).toBe("2 giorni");
    } finally {
      if (original) Object.defineProperty(Intl, "PluralRules", original);
    }
  });

  it("formats money in whole euros", () => {
    expect(formatMoney(34_099, "EUR").replace(/\s/g, " ")).toBe("340 €");
    setLanguage("en");
    expect(formatMoney(34_099, "EUR")).toBe("€340");
  });

  it("spells phone numbers digit by digit", () => {
    expect(spellDigits("800 558822")).toBe("8 0 0 5 5 8 8 2 2");
  });
});
